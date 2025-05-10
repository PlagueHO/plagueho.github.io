---
title: "Automate on-boarding Azure Log Analytics Container Monitoring of any Linux Docker Host using Azure Arc"
date: 2020-08-23
description: "A guide to configuring Azure Monitor Container Monitoring on any Linux Docker host using Azure Arc"
tags:
  - "azure-arc"
  - "azure-log-analytics"
  - "azure-resource-manager-templates"
  - "docker"
image: "/assets/images/blog/ss_containermonitoring_infoimage-1.png"
---

That title is a bit of a mouthful, but this post will show how easy it is to configure a Linux Docker host to be monitored by [Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/overview).

Azure Monitor can be used to monitor machines that are running in **Azure**, in **any cloud** or **on-premises**. For a machine to be monitored by Azure Monitor, it needs to have the [Microsoft Monitoring Agent](https://docs.microsoft.com/en-us/services-hub/health/mma-setup) (MMA) installed. The machine either needs to be able to connect to Azure directly or via a [Log Analytics Gateway](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/gateway).

But to make things a lot easier, we're going to set up the Docker host to allow it to be managed in Azure using [Azure Arc](https://docs.microsoft.com/en-us/azure/azure-arc/servers/overview). This will allow Azure Arc to install MMA for us. The Linux Docker host will appear in the Azure portal like other Azure resources:

![](/assets/images/blog/ss_containermonitoring_azurearc.png)

Azure Arc managed machines running outside of Azure

We will also add the [Container Monitoring solution](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/containers) to our Azure Monitor Log Analytics workspace. The Container Monitoring solution will set up the Log Analytics workspace to [record telemetry data](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/containers#container-records) from your Linux Docker host and add a **container monitoring dashboard**.

![](/assets/images/blog/ss_containermonitoring_containermonitorsolution.png)

Container Monitoring Solution dashboard in an Azure Monitor Log Analytics Workspace

To enable collection and sending of telemetry from all containers running on the Docker host, a [microsoft/oms container](https://hub.docker.com/r/microsoft/oms) is run on it. This Docker container will connect to the Azure Monitor Log Analytics workspace and send logs and performance counters from all Docker containers running on the host.

Once we have completed the configuration of the Docker Host, the following telemetry will be sent to your Log Analytics workspace:

- Host diagnostics/logs.
- Host performance metrics.
- Diagnostics/logs from any Docker containers on the host.
- Performance metrics from any Docker containers on the host.

The cost of sending this telemetry to your Azure Monitor Log Analytics workspace will depend on the [volume of data ingested](https://azure.microsoft.com/en-us/pricing/details/monitor/). You can control this by reducing the frequency with which performance counters are transmitted. By default this is sent every 60 seconds. You can configure this through the Log Analytics workspace.

![](/assets/images/blog/ss_containermonitoring_configureperformancecounterfrequency.png)

Configuring performance counter frequency

## What you need

These instructions assumes you have the following:

1. An **Azure** account - [get a free account here](https://azure.microsoft.com/en-us/free/).
1. A **Resource Group** to contain the machines you register with Azure Arc - [instructions on how to create one](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal#create-resource-groups).
1. A **Log Analytics Workspace** - [instructions on how to create one](https://docs.microsoft.com/en-us/azure/azure-monitor/learn/quick-create-workspace). This is where all the diagnostic and metric data will be sent from the Docker hosts.
1. **Azure Cloud Shell** enabled - [how to use Azure Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/using-the-shell-window).
1. **SSH access** to your Docker host to connect to **Azure Arc**.
1. **Important:** the Linux host you are going to install MMA on must have Python installed. If it is not installed you will receive an "_Install failed with exit code 52 Installation failed due to missing dependencies._" error when you install the MMA Agent.

## Connect Linux Host to Azure Arc

The first step is to connect our Linux host to Azure Arc so that we can use it to perform all the other steps directly from the Azure Portal. We are going to use a [service principal for onboarding the machine](https://docs.microsoft.com/en-us/azure/azure-arc/servers/onboard-service-principal) as this will make it easier to automate.

We are going to run [this Azure Arc Onboarding script generator PowerShell script](64a2fd67489ea22b3ca09cd5bf3a0782) in **Azure Cloud Shell** to create the **Service Principal** and generate the Linux Shell script for us. It can also generate a PowerShell script for onboarding **Windows machines** to Azure Arc.

1. Open Azure Cloud Shell and ensure you're [using PowerShell](https://docs.microsoft.com/en-us/azure/cloud-shell/using-the-shell-window#swap-between-bash-and-powershell-environments).
1. Download the script by running:

   ```powershell
   Invoke-WebRequest -Uri https://gist.githubusercontent.com/PlagueHO/64a2fd67489ea22b3ca09cd5bf3a0782/raw/Get-AzureArcOnboardingScript.ps1 -OutFile ~\Get-AzureArcOnboardingScript.ps1
   ```

   ![](/assets/images/blog/ss_containermonitoring_cloudshelldownloadscriptgenerator.png)

1. Run the script by executing the following command and setting the `TenantId`, `SubscriptionId`, `Location` and `ResourceGroup` parameters:

   ```powershell
   ./Get-AzureArcOnboardingScript.ps1 -TenantId '<TENANT ID>' -SubscriptionId '<SUBSCRIPTION ID>' -Location '<LOCATION>' -ResourceGroup '<RESOURCE GROUP>'
   ```
  
   ![](/assets/images/blog/ss_containermonitoring_cloudshellgeneratescript.png)

   You will need to [get your Tenant ID from the Azure Portal](https://microsoft.github.io/AzureTipsAndTricks/blog/tip153.html). The **Subscription Id** and **Resource Group** is the subscription and resource group respectively to register the machine in. The **Location** is the Azure region that the machine metadata will be stored.
1. Copy the script that was produced. We will execute it on any Linux machine we want to onboard.
1. SSH into the Linux Host and run (paste) the script:
   ![](/assets/images/blog/ss_containermonitoring_onboardmachinetoarc.gif)
   ![](/assets/images/blog/ss_containermonitoring_cloudshellonboardedok.png)
   In a real production environment you'd probably automate this process and you'd also need to protect the secrets in the script.
1. Once the installation is complete, the machine will appear in the Azure Portal in the resource group:
   ![](/assets/images/blog/ss_containermonitoring_azurearconboarded.png)

Now that the machine is **onboarded into Azure Arc**, we can use it to install Microsoft Monitoring Agent (MMA) and then run the [microsoft/oms Docker container](https://hub.docker.com/r/microsoft/oms).

_**Further Improvements:** we could easily have used something like [PowerShell DSC](https://docs.microsoft.com/en-us/powershell/scripting/dsc/overview/overview?view=powershell-7) or Ansible to apply the Azure Arc onboarding configuration to the machine, but this is beyond the scope of this post. In a fully mature practice, there would be **no need for logging directly into the host** at any point in this process._

## Installing MMA with Azure Arc

At the time of writing this blog post, there wasn't an Azure PowerShell module or AzCLI extension for Azure Arc. So automating this process right now will require the use of an ARM template:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "MachineName": {
            "type": "String"
        },
        "Location": {
            "type": "String"
        },
        "WorkspaceId": {
            "type": "String"
        },
        "WorkspaceKey": {
            "type": "String"
        }
    },
    "variables": {},
    "resources": [
        {
            "type": "Microsoft.HybridCompute/machines/extensions",
            "apiVersion": "2019-12-12",
            "name": "[concat(parameters('MachineName'), '/OMSAgentForLinux')]",
            "location": "[parameters('Location')]",
            "properties": {
                "publisher": "Microsoft.EnterpriseCloud.Monitoring",
                "type": "OmsAgentForLinux",
                "autoUpgradeMinorVersion": true,
                "settings": {
                    "workspaceId": "[parameters('WorkspaceId')]"
                },
                "protectedSettings": {
                    "workspaceKey": "[parameters('WorkspaceKey')]"
                }
            }
        }
    ]
}
```

**Important:** Before you attempt this step, make sure the machine you are deploying MMA to has Python installed on it. If it is not installed you will receive an "_Install failed with exit code 52 Installation failed due to missing dependencies._" error when you install the MMA Agent.

To apply the ARM Template in **Azure Cloud Shell**:

1. Run this command to download the ARM Template:

```powershell
Invoke-WebRequest -Uri https://gist.githubusercontent.com/PlagueHO/74c5035543c454daf3d28f33ea91cde0/raw/AzureArcLinuxMonitoringExtensions.json -OutFile ~\AzureArcLinuxMonitoringExtensions.json
```

1. Apply the ARM Template to an Azure Arc machine by running this command (replacing the values in the strings):

   ```powershell
   New-AzResourceGroupDeployment `
     -ResourceGroupName '<NAME OF RESOURCE GROUP CONTAINING ARC MACHINES>' `
     -TemplateFile ~/AzureArcLinuxMonitoringExtensions.json `
     -TemplateParameterObject @{
       MachineName = '<NAME OF AZURE ARC MACHINE>'
       Location = '<LOCATION OF AZURE ARM MACHINE>'
       WorkspaceId = '<WORKSPACE ID OF LOG ANALYTICS WORKSPACE>'
       WorkspaceKey = '<WORKSPACE KEY OF LOG ANALYTICS WORKSPACE>'
     }
   ```

   ![](/assets/images/blog/ss_containermonitoring_installingmmaextension.png)
   You can get the `WorkspaceId` and `WorkspaceKey` values by locating your Log Analytics Workspace in the Azure Portal and clicking **Agents Management** in the side bar.

    _**Important:** If you're automating this, you'll want to take care not to expose the **Workspace Key**._

1. You can navigate to the **Azure Arc Machine** resource in the **Azure Portal** and select the extension to see that it is "creating". It will take a between 5 and 10 minutes before installation of the extension is **completed**.
1. Once installation has **completed**, you can navigate to your **Azure Monitor Log Analytics Workspace**, click **Agents Management** in the side bar and select **Linux Agents**. You should notice that the number of agents has increased:
   ![](/assets/images/blog/ss_containermonitoring_mmaonboarded.png)
1. Clicking **Go to logs** will show all **Linux Machines** that Azure Monitor Log Analytics has received a **Heartbeat** from:
   ![](/assets/images/blog/ss_containermonitoring_loganalyticsheartbeat.png)

## Enable Container Telemetry

So far, so good. We've onboarded the machine to Azure Arc and enabled host logging to a Azure Monitor Log Analytics workspace. However, we're only getting telemetry data from the host, not any of the containers. So the next thing we need to do is execute the following command on the host:

```shell
sudo docker run --privileged -d -v /var/run/docker.sock:/var/run/docker.sock -v /var/lib/docker/containers:/var/lib/docker/containers -e WSID="<YOUR WORKSPACE ID>" -e KEY="<YOUR WORKSPACE KEY>" -h=`hostname` -p 127.0.0.1:25225:25225 --name="omsagent" --restart=always microsoft/oms:1.8.1-256
```

This will download and run the [microsoft/oms container image](https://hub.docker.com/r/microsoft/oms) on the host and configure it to send telemetry for all containers running on this host to your **Azure Monitor Log Analytics workspace**.

_**Important:** If you are installing onto Ubuntu server, you can avoid problems in this stage by making sure you've installed Docker using the [official Docker repository and instructions](https://docs.docker.com/engine/install/ubuntu/). I had used Snap on Ubuntu 18.05, which resulted in this error '**Error response from daemon: error while creating mount source path '/var/lib/docker/containers': mkdir /var/lib/docker: read-only file system.**' when running the script._

The way to automate the installation of this on the host is to again use an ARM Template, but this time use the [Linux Custom Script extension](https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-linux) to execute the above command. You can see the [ARM Template here](c3f09056cace496dded18da8bc1ed589). This ARM template could easily be combined into the ARM template from the preceding stage, but I kept them separate for the purposes of showing the process.

1. Run this command to download the ARM Template:

   ```powershell
   Invoke-WebRequest -Uri https://gist.githubusercontent.com/PlagueHO/c3f09056cace496dded18da8bc1ed589/raw/AzureArcLinuxCustomScriptExtensions.json -OutFile ~\AzureArcLinuxCustomScriptExtensions.json
   ```

1. Apply the ARM Template to an Azure Arc machine by running this command (replacing the values in the strings with the same ones as before):

   ```powershell
   New-AzResourceGroupDeployment `
     -ResourceGroupName '<NAME OF RESOURCE GROUP CONTAINING ARC MACHINES>' `
     -TemplateFile ~/AzureArcLinuxCustomScriptExtensions.json `
     -TemplateParameterObject @{
       MachineName = '<NAME OF AZURE ARC MACHINE>'
       Location = '<LOCATION OF AZURE ARM MACHINE>'
       WorkspaceId = '<WORKSPACE ID OF LOG ANALYTICS WORKSPACE>'
       WorkspaceKey = '<WORKSPACE KEY OF LOG ANALYTICS WORKSPACE>'
     }
   ```

   ![](/assets/images/blog/ss_containermonitoring_customscriptcreating-1.png)
1. After a few minutes installation of the **CustomScript** extension should have completed and should show **Succeeded** in the Azure Portal.
   ![](/assets/images/blog/ss_containermonitoring_customscriptsucceeded.png)
1. If you SSH into the Linux Container host and run `sudo docker ps` you will see that the **omsagent** container is running:
   ![](/assets/images/blog/ss_containermonitoring_omsagentrunning.png)

The process is now complete and we're getting telemetry from both the host and the containers running on it. We only needed to log into the host initially to onboard it into Azure Arc, but after that all other steps were performed by Azure. We could have performed the onboarding using automation as well and that would be the **recommended** pattern to use in a production environment.

## Configure Performance Counters Sample Interval

The final (and optional) step is to configure **sample interval** that performance counters will be collected on each Linux host. To do this:

1. Open the [Azure Portal](https://portal.azure.com/).
1. Navigate to your **Azure Monitor Log Analytics Workspace**.
1. Click **Advanced Settings**:
   ![](/assets/images/blog/ss_containermonitoring_loganalyticsadvancedsettings.png)
1. Select **Data**, then **Linux Performance Counters**:
   ![](/assets/images/blog/ss_containermonitoring_loganalyticsconfigperf.png)
1. Configure the **Sample Interval** and click **Save**.

The updated counter sample interval will be updated in the Microsoft Monitoring Agent configuration on the host.

## See It All In Action

Now that everything is all set up, let's see what it looks like in Azure Monitor.

1. Open the [Azure Portal](https://portal.azure.com/).
1. Navigate to your **Azure Monitor Log Analytics Workspace**.
1. Click **Workspace Summary** in the side bar.
1. Click **Container Monitoring Solution** in the workspace overview:
   ![](/assets/images/blog/ss_containermonitoring_loganalyticscontainersolution.png)
1. You can now browse through the Container Monitoring Solution dashboard and see your hosts are being monitored as well as see performance information from your containers:
   ![](/assets/images/blog/ss_containermonitoring_containermonitoring.gif)

It really is fairly easy to get set up and once configured will give you much greater visibility over your entire estate, no matter where it is running.
