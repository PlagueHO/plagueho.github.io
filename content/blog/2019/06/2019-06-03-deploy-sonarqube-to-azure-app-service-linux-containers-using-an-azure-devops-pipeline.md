---
title: "Deploy Sonarqube to Azure App Service Linux Containers using an Azure DevOps Pipeline"
date: "2019-06-03"
categories:
  - "azure-devops"
  - "azure-sql-server"
  - "azure-web-app"
  - "containers"
  - "docker"
tags:
  - "azure"
  - "azure-pipelines"
  - "azure-sql-database"
coverImage: "ss_sonarqube_architecture-1.png"
---

_Update 2020-10-12: I have updated the [101-webapp-linux-sonarqube-azuresql](https://github.com/Azure/azure-quickstart-templates/pull/8410) Azure Resource Manager quick start template to default to **7.7-community** edition and prevent deployment of versions that aren't currently compatible with Azure App Service Web App Containers._

_Update 2020-10-09: It was pointed out to me that the process in this post had stopped working. The container was not starting up correctly. Upon investigation I found that this was because newer versions of the Sonarqube container includes ElasticSearch which requires additional heap memory to be assigned. Therefore the latest versions of Sonarqube can't be used with this process. I am working on a full resolution to this issue, but in the meantime ensure you're only using Sonarqube **7.7-community** edition. I have updated the ARM template to no longer default to **latest** for the **sonarqubeImageVersion** parameter. There is also an [issue in GitHub](https://github.com/Azure/azure-quickstart-templates/issues/7481) against the ARM template._

[Sonarqube](https://www.sonarqube.org/) is a web application that development teams typically use during the application development process to continuous validate the quality of the code.

This post is not specifically about Sonarqube and how it works. It is intended to show Developers & IT Pros how to deploy a service to Azure using contemporary **infrastructure as code** and **DevOps** patterns.

## The Implementation

A Sonarqube installation is made up of a web application front end backed by database.

![ss_sonarqube_architecture](/images/ss_sonarqube_architecture-1.png)

Sonarqube supports many [different types of databases](https://docs.sonarqube.org/latest/setup/install-server/), but I chose to use [Azure SQL Database](https://azure.microsoft.com/en-in/services/sql-database/). I decided to use Azure SQL Database for the following reasons:

1. It is a **managed service**, so I don't have to worry about patching, securing and looking after SQL servers.
   1. I can **scale** the database performance up and down easily with code. This allows me to balance my performance requirements with the cost to run the server or even dial performance right back at times when the service is not being used.
   1. I can make use of the new [Azure SQL Database serverless](https://docs.microsoft.com/en-us/azure/sql-database/sql-database-serverless) (spoiler alert: there are still SQL servers). This allows the SQL Database to be **paused** when not being accessed by the Sonarqube front end. It can be used to further reduce costs running Sonarqube by allowing me to delete the front end every night and only pay for the storage costs when developers aren't developing code.![ss_sonarqube_sql_server_serverless](/images/ss_sonarqube_sql_server_serverless.png)

For the front end web application I decided to use the [Azure Web App for Containers](https://azure.microsoft.com/en-in/services/app-service/containers/) running a Linux container using the official [Sonarqube Docker image](https://hub.docker.com/_/sonarqube/). Because the Sonarqube web application is stateless it is a great target for being able to be delete and recreate from code. The benefits to using Azure Web App for Containers are:

1. Azure Web App for Containers is a **managed service**, so again, no patching, securing or taking care of servers.
1. I can **scale** the performance **up** and **down** and **in** and **out** from within my pipeline. This allows me to quickly and easily tune my performance/cost, even on a schedule.
1. I can **delete and rebuild** my front end web application by running the pipeline in under 3 minutes. So I can completely delete my front end and save money when it is not in use (e.g. when teams aren't developing in the middle of the night).

## Architectural Considerations

The Sonarqube web application, as it has been architected, is accessible from the **public internet**. This might not meet your security requirements, so you might wish to change the architecture in the following ways:

1. Putting an [Azure Application Gateway](https://docs.microsoft.com/en-us/azure/application-gateway/overview) (a layer 7 router) in front of the service.
1. Isolate the service in a [Azure Virtual Network](https://docs.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview) from the internet and make it only accessible to your development services. This may also require [Azure ExpressRoute](https://azure.microsoft.com/en-us/services/expressroute/) or other VPN technologies to be used.
1. We are using the SQL Server administrator account for the Sonarqube front end to connect to the backend. This is not advised for a production service - instead, a user account specifically for the use of Sonarqube should be created and the password stored in an Azure Key Vault.

These architectural changes are beyond the scope of this document though as I wanted to keep the services simple. But the pattern defined in this post will work equally well with these architectures.

## Techniques

Before we get into the good stuff, it is important to understand why I chose to **orchestrate** the deployment of these services using an [Azure Pipeline](https://azure.microsoft.com/en-us/services/devops/pipelines/).

I could have quite easily built the infrastructure manually straight into the Azure Portal or using some [Azure PowerShell](https://docs.microsoft.com/en-us/powershell/azure/overview) automation or the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest), so why do it this way?

There are a number of reasons that I'll list below, but this is the most mature way to deploy applications and services.

![ss_sonarqube_journey_of_an_Azure_professional](/images/ss_sonarqube_journey_of_an_azure_professional.png)

1. I wanted to define my services using **infrastructure as code** using an [Azure Resource Manager template](https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-group-authoring-templates).
1. I wanted the infrastructure as code under **version** **control** using [Azure Repos](https://azure.microsoft.com/en-us/services/devops/repos/). I could have easily used GitHub here or one of a number of other Git repositories, but I'm using Azure Repos for simplicity.
1. I wanted to be able to **orchestrate the deployment** of the service using a CI/CD pipeline using [Azure Pipelines](https://azure.microsoft.com/en-us/services/devops/pipelines/) so that the process was **secure**, **repeatable** and **auditable**. I also wanted to **parameterize** my pipeline so that I could configure the parameters of the service (such as size of the resources and web site name) outside of version control. This would also allow me to scale the services by tweaking the parameters and simply redeploying.
1. I wanted to use a [YAML multi-stage pipeline](https://devblogs.microsoft.com/devops/whats-new-with-azure-pipelines/) so that the pipeline definition was stored in **version** **control** (a.k.a. **pipeline as code**). This also enabled me to break the process of deployment into two stages:
    - Build - publish a copy of the Azure Resource Manager templates as an artifact.
    - Deploy to Dev - deploy the resources to Azure using the artifact produced in the build.

_Note: I've made my version of all these components **public**, so you can see how everything is built. You can find my Azure DevOps repository [here](https://dev.azure.com/dscottraynsford/_git/Sonarqube-Azure) and the Azure Pipeline definition [here](https://dev.azure.com/dscottraynsford/Sonarqube-Azure/_build)._

## Step 1 - Create a project in Azure DevOps

First up we need to have an **Azure DevOps organization**. You can sign up for a **completely free** one that will everything you need by going [here](https://azure.microsoft.com/en-us/services/devops/) and clicking **start free**. I'm going to assume you have your DevOps organization all set up.

1. In your browser, log in to your Azure DevOps organization.
1. Click **\+ Create project** to create a new project.
1. Enter a **Project Name** and optionally a **Description**.
1. Select **Public** if you want to allow anyone to view your project (they can't contribute or change it). Otherwise leave it as **Private** to make it only visible to you.
1. Click **Create**.

![ss_sonarqube_createproject](/images/ss_sonarqube_createproject.gif)

You've now got an **Azure** **Repo** (version control) as well as a place to create **Azure Pipelines** as well as a whole lot of other tools, such as Azure Boards, that we're not going to be using for this project.

## Step 2 - Add ARM Template Files to the Repo

Next, we need to initialize our repository and then add the **Azure Resource Manager** **(ARM) template** files and the **Azure Pipeline definition** (YAML) file. We're going to be adding all the files to the repository directly in the browser, but if you're comfortable using Git, then I'd suggest using that.

1. Select **Repos** \> **Files** from the nav bar.
1. Make sure **Add a README** is ticked and click **Initialize**.![ss_sonarqube_initializerepo](/images/ss_sonarqube_initializerepo.gif)
1. Click the **ellipsis** (...) next to the **repo** name and select **Create a new folder**.
1. Set the **Folder name** to **infrastructure.** The name matters because the pipeline definition expects to find the ARM template files in that folder.
1. Enter a **checkin** **comment** of "Added infrastructure folder".
1. Click **Create**.![ss_sonarqube_createinfrastructurefolder](/images/ss_sonarqube_createinfrastructurefolder.gif)
1. Once the folder has been created, we need to add two files to it:
    - **sonarqube.json** - The ARM template representing the infrastructure to deploy.
    - **sonarqube.parameters.json** - The ARM template default parameters.
1. Click [here](https://dev.azure.com/dscottraynsford/9e9a4415-9d4d-4e6d-bc2f-933025d16ed6/_apis/git/repositories/00b39c50-2a21-408f-9ae2-7e66b7fb2506/Items?path=%2Finfrastructure%2Fsonarqube.json&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&download=true&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1) to download a copy of the sonarqube.json. You can see the content of this file [here](https://dev.azure.com/dscottraynsford/_git/Sonarqube-Azure?path=%2Finfrastructure%2Fsonarqube.json&version=GBmaster&line=1&lineStyle=plain&lineEnd=2&lineStartColumn=1&lineEndColumn=1).
1. Click [here](https://dev.azure.com/dscottraynsford/9e9a4415-9d4d-4e6d-bc2f-933025d16ed6/_apis/git/repositories/00b39c50-2a21-408f-9ae2-7e66b7fb2506/Items?path=%2Finfrastructure%2Fsonarqube.parameters.json&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&download=true&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1) to download a copy of the sonarqube.parameters.json. You can see the content of this file [here](https://dev.azure.com/dscottraynsford/_git/Sonarqube-Azure?path=%2Finfrastructure%2Fsonarqube.parameters.json&version=GBmaster&line=1&lineStyle=plain&lineEnd=2&lineStartColumn=1&lineEndColumn=1).
1. Click the **ellipsis (...)** next to the **infrastructure folder** and select **Upload file(s)**.
1. Click the **Browse** button and select the **sonarqube.json** and **sonarqube.parameters.json** files you downloaded.
1. Set the **Comment** to something like "Added ARM template".
1. Ensure **Branch name** is set to **master** (it should be if you're following along).
1. Click **Commit**.![ss_sonarqube_uploadarmtemplate](/images/ss_sonarqube_uploadarmtemplate.gif)

We've now got the ARM Template in the repository and under version control. So we can track any changes to them.

_**Note:** When we created the **infrastructure** folder through the Azure DevOps portal a file called \_PlaceHolderFile.md was automatically created. This is created because Git doesn't allow storing empty folders. You can safely delete this file from your repo if you want._

## Step 3 - Create your Multi-stage Build Pipeline

Now that we've got a repository we can create our **mulit-stage build pipeline**. This build pipeline will package the **infrastructure files** and store them and then perform a deployment. The **multi-stage build** **pipeline** is defined in a file called **azure-pipelines.yml** that we'll put into the root folde of our repository.

1. Click [here](https://dev.azure.com/dscottraynsford/9e9a4415-9d4d-4e6d-bc2f-933025d16ed6/_apis/git/repositories/00b39c50-2a21-408f-9ae2-7e66b7fb2506/Items?path=%2Fazure-pipelines.yml&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&download=true&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1) to download a copy of the **azure-pipelines.yml**. You can see the content of this file [here](https://dev.azure.com/dscottraynsford/_git/Sonarqube-Azure?path=%2Fazure-pipelines.yml&version=GBmaster&line=1&lineStyle=plain&lineEnd=2&lineStartColumn=1&lineEndColumn=1).
1. Click the **ellipsis (...)** button next to the repository name and select **Upload file(s)**.
1. Click **Browse** and select the **azure-pipelines.yml** file you dowloaded.
1. Set the **Comment** to something like "Added Pipeline Defnition".
1. Click **Commit**.![ss_sonarqube_uploadpipelinefile](/images/ss_sonarqube_uploadpipelinefile.gif)
1. Click **Set up build** button.
1. **Azure Pipelines** will automatically detect the **azure-pipelines.yml** file in the root of our repository and configure our pipeline.
1. Click the **Run** button. The build will fail because we haven't yet created the **service connection** called **Sonarqube-Azure** to allow our pipeline to deploy to Azure. We also still still need to configure the **parameters** for the pipeline.![ss_sonarqube_createbuildpipeline](/images/ss_sonarqube_createbuildpipeline.gif)

_Note: I'll break down the contents of the **azure-pipelines.yml** at the end of this post so you get a feel for how a **multi-stage build pipeline** can be defined._

## Step 4 - Create Service Connection to Azure

For **Azure Pipelines** to be able to deploy to Azure (or access other external services) it needs a **service connection** defined. In this step we'll configure the service sonnection called **Sonarqube-Azure** that is referred to in the **azure-pipelines.yml** file. I won't go into too much detail about what happens when we create a service connection as Azure Pipelines takes care of the details for you, but if you want to know more, read [this page](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/connect-to-azure?view=azure-devops).

_Important: This step assumes you have permissions to create **service connections** in the project and permissions to Azure to create a new Serivce Principal account with contributor permissions within the subscription. Many users won't have this, so you might need to get a user with the enough permissions to the Azure subscription to do this step for you._

1. Click the **Project settings** button in your project.
1. Click **Service connections** under the **Pipelines** section.
1. Click **New service connection**.
1. Select **Azure Resource Manager**.
1. Make sure **Service Principal Authentication** is selected.
1. Enter **Sonarqube-Azure** for the **Connection name**. _This must be exact, otherwise it won't match the value in the **azure-pipelines.yml** file._
1. Set **Scope level** to **Subscription**.
1. From the **Subscription** box, select your **Azure Subscription**.
1. Make sure the **Resource group** box is empty.
1. Click **OK**.
1. An authorization box will pop up requesting that you authenticate with the Azure subscription you want to deploy to.
1. Enter the account details of a user who has **permissions** to create a **Service Principal** with **contributor** access to the **subscription** selected above**.**![ss_sonarqube_createserviceconnection](/images/ss_sonarqube_createserviceconnection-1.gif)

You now have a **service connection** to Azure that any build pipeline (including the one we created earlier) in this project can use to deploy services to Azure.

_Note: You can restrict the use of this **Service connection** by changing the Roles on the **Service connection**. See [this page](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml#secure-a-service-connection) for more information._

## Step 5 - Configure Pipeline Parameters

The **ARM template** contains a number of parameters which allow us to configure some of the things about the Azure resources we're going to deploy, such as the Location (data center) to deploy to, the size of the resources and the site name our Sonarqube service will be exposed on.

In the **azure-pipelines.yml** file we [configure the parameters](https://dev.azure.com/dscottraynsford/_git/Sonarqube-Azure?path=%2Fazure-pipelines.yml&version=GBmaster) that are passed to the ARM template from **pipeline** **variables**. _Note: There are additional ARM template parameters that are exposed (such as_ _sqlDatabaseSkuSizeGB and sonarqubeImageVersion), but we'll leave the configuration of those parameters as a seprate exercise._

The parameters that are exposed as **pipeline variables** are:

- **siteName** - The name of the web site. This will result in the Sonarqube web site being hosted at \[_siteName_\].azurewebsites.net.
- **sqlServerAdministratorUsername** - The administrator username that will be used to administer this SQL database and for the Sonarqube front end to connct using. _Note: for a Production service we should actually create another account for Sonarqube to use._
- **sqlServerAdministratorPassword** - The password that will be used by Sonarqube to connect to the database.
- **servicePlanCapacity** - The number of App Service plan nodes to use to run this Sonarqube service. Recommend leaving it at 1 unless you've got really heavy load.
- **servicePlanPricingTier** - This is the App Service plan pricing tier to use for the service. Suggest S1 for testing, but for systems requiring greater performance then S2, S3, P1V2, P2V2 or P3V2.
- **sqlDatabaseSkuName** \- this is the performance of the SQL Server. There are a number of different performance options [here](https://dev.azure.com/dscottraynsford/_git/Sonarqube-Azure?path=%2Finfrastructure%2Fsonarqube.json&version=GBmaster&line=63&lineStyle=plain&lineEnd=64&lineStartColumn=1&lineEndColumn=1) and what you chose will need to depend on your load.
- **location** \- this is the code for the data center to deploy to. I use **WestUS2**, but chose whatever datacenter you wish.

The great thing is, you can change these variables at any time and then run your pipeline again and your infrastructure will be changed (scaled up/down/in/out) accordingly - without losing data. _Note: You can't change location or siteName after first deployment however._

To create your variables:

1. Click **Pipelines**.
1. Click the **SonarqubeInAzure** pipeline.
1. Click the **Edit** button.
1. Click the **menu** button (vertical **ellipsis**) and select **Variables**.
1. Click the **Add** button and add the following parameters and values:
    - **siteName** - The globally unique name for your site. This will deploy the service to \[_siteName_\].azurewebsites.net. If this does not result in a globally unique name an error will occur during deployment.
    - **sqlServerAdministratorUsername** - Set to **sonarqube**.
    - **sqlServerAdministratorPassword** - Set to a strong password consisting of at least 8 characters including upper and lower case, numbers and symbols. _Make sure you click the **lock symbol** to let Azure DevOps know this is a password and to treat it accordignly._
    - **servicePlanCapacity** - Set to **1** for now (you can always change and scale up later).
    - **servicePlanPricingTier** - Set to **S1** for now (you can always change and scale up later).
    - **sqlDatabaseSkuName** \- Set to **GP\_Gen5\_2** for now (you can always change and scale up later). _If you want to use the SQL Serverless database, use **GP\_S\_Gen5\_1**, **GP\_S\_Gen5\_2** or **GP\_S\_Gen5\_4**._
    - **location** \- set to **WestUS2** or whatever the code is for your preferred data center.
1. You can also click the **Settable at Queue** time box against any of the parameters you want to be able to set when the job is manually queued.![ss_sonarqube_createvariables](/images/ss_sonarqube_createvariables.gif)![ss_sonarqube_variables](/images/ss_sonarqube_variables.png)
1. Click the **Save and Queue** button and select **Save**.

We are now ready to deploy our service by triggering the pipeline.

## Step 6 - Run the Pipeline

The most common way an **Azure Pipeline** is going to get **triggered** is by **committing a change** to the repository the build pipeline is linked to. But in this case we are just going to trigger a **manual build**:

1. Click **Pipelines**.
1. Click the **SonarqubeInAzure** pipeline.
1. Click the **Run pipeline**.
1. Set any of the variables we want to change (for example if we wanted to scale up our services).
1. Click **Run**.
1. You can then watch the **build** and **deploy** stages complete.![ss_sonarqube_runpipeline.gif](/images/ss_sonarqube_runpipeline.gif)

Your **pipeline** should have completed and your resources will be on thier way to being deployed to Azure. You can rerun this pipeline at any time with different variables to scale your services. You could even delete the front end app service completely and use this pipeline to redeploy the service again - saving lots of precious $$$.

## Step 7 - Checkout your new Sonarqube Service

You can login to the Azure Portal to see the new resource group and resources that have been deployed.

1. Open the [Azure portal](https://portal.azure.com) and log in.  
1. You will see a new resource group named **\[siteName]-rg**.  
1. Open the **\[siteName]-rg**.  
   ![ss_sonarqube_resources](/images/ss_sonarqube_resources.png)  
1. Select the Web App with the name **\[siteName]**.  
   ![ss_sonarqube_webapp](/images/ss_sonarqube_webapp.png)  
1. Click the **URL**.  
1. Your **Sonarqube** application will open after a few seconds.\
   _Note: It may take a little while to load the first time depending on the performance you configured on your SQL database._  
   ![ss_sonarqube_theapplication](/images/ss_sonarqube_theapplication.png)  
1. Log in to Sonarqube with the username **admin** and the password **admin**.\
   **Remember to change this password immediately.**

You are now ready to use Sonarqube in your build pipelines.

## Step 8 - Scaling your Sonarqube Services

One of the purposes of this process was to enable the resources to be scaled easily and non-destructively. All we need to do is:

1. Click **Pipelines**.  
1. Click the **SonarqubeInAzure** pipeline.  
1. Click **Run pipeline**.  
1. Adjust any variables to scale the service up, down, in, or out.  
1. Click **Run**.  
1. Watch the **build** and **deploy** stages complete.

Of course you could do a lot of the scaling with **Azure Automation**, which is a better idea in the long term than using your build pipeline to scale the services because you'll end up with hundreds of deployment records over time.

## A Closer look at the Multi-stage Build Pipeline YAML

At the time of writing this post, the **Multi-stage Build Pipeline YAML** was relatively new and still in a preview state. This means that it is not fully documented. So, I'll break down the file and highlight the interesting pieces:

### Trigger

![ss_sonarqube_yamltrigger](/images/ss_sonarqube_yamltrigger.png)

This section ensures the pipeline will only be triggered on changes to the **master** branch.

### Stages

![ss_sonarqube_yamlstages](/images/ss_sonarqube_yamlstages.png)

This section contains the two stages: **Build** and **Deploy**. We could have as many stages as we like. For example: Build, Deploy Test, Deploy Prod.

### Build Stage

![ss_sonarqube_yamlbuildstage](/images/ss_sonarqube_yamlbuildstage.png)

This defines the steps to run in the build stage. It also requires the execution of the stage on an **Azure DevOps** agent in the **vs2017-win2016** pool.

### Build Stage Checkout Step

![ss_sonarqube_yamlbuildcheckout](/images/ss_sonarqube_yamlbuildcheckout.png)

This step causes the **repository** to be checked out onto the **Azure DevOps** agent.

### Build Stage Publish Artifacts Step

![ss_sonarqube_yamlbuildpublish](/images/ss_sonarqube_yamlbuildpublish.png)

This step takes the **infrastructure** folder from the checked out **repository** and stores it as an artifact that will always be accessible as long as the build record is stored. The artifact will also be made available to the next stage (the **Deploy Stage**). The purpose of this step is to ensure we have an **immutable artifact** available that we could always use to redeploy this exact build.

### Deploy Stage

![ss_sonarqube_yamldeploystage](/images/ss_sonarqube_yamldeploystage.png)

The deploy stage takes the artifact produced in the **build stage** and deploys it. It runs on an Azure DevOps agent in the **vs2017-win2016** pool.

It also specifies that this is a deployment to an environment called "**dev**". This will cause the environment to show up in the **environments** section under **pipelines** in **Azure DevOps**.

![ss_sonarqube_environments.png](/images/ss_sonarqube_environments.png)

The **strategy** and **runOnce** define that this deployment should only execute once each time the pipeline is triggered.

### Deploy Stage Azure Resource Group Deployment Step

![ss_sonarqube_yamldeploystep](/images/ss_sonarqube_yamldeploystep.png)

This deploy step takes the ARM template from the **infrastructure** artifact and deploys it to the **Sonarqube-Azure** Service connection. It overrides the parameters (using the **overrideParameters**) property using **build variables** (e.g. _$(siteName)_, _$(servicePlanCapacity)_).

## But what about Azure Blueprints?

One final thing to consider: this deployment could be a great use case for implementing with [Azure Blueprints](https://azure.microsoft.com/en-in/services/blueprints/). I would strongly suggest taking a look at using your build pipeline to deploy an Azure Blueprint containing the ARM template above.

Thank you very much for reading this and I hope you found it interesting.
