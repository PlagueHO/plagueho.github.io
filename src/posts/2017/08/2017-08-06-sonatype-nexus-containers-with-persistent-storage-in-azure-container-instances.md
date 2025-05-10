---
title: "Sonatype Nexus Containers with Persistent Storage in Azure Container Instances"
date: 2017-08-06
description: "Running Sonatype Nexus 2 and 3 containers with persistent storage in Azure Container Instances."
tags:
  - "azure"
  - "azure-container-instance"
image: "/assets/images/blog/ss_aci_sonatypenexus3.png"
---

On the [back of yesterdays post](https://dscottraynsford.wordpress.com/2017/08/05/persistent-storage-in-azure-container-instances/) on running Azure Container Instance containers with persistent storage, I thought I'd try a couple of other containers with [my script](https://dscottraynsford.wordpress.com/2017/08/05/persistent-storage-in-azure-container-instances/).

> [!NOTE]
> I don't actually plan on running any of these apps, I just wanted to test out the process and my scripts to identify any problems.

I tried:

- [Sonatype Nexus 2](https://hub.docker.com/r/sonatype/nexus/) - sonatype/nexus:oss
- [Sonatype Nexus 3](https://hub.docker.com/r/sonatype/nexus3/) - sonatype/nexus3:latest
- [Jenkins](https://hub.docker.com/r/jenkins/jenkins/) - jenkins/jenkins

And here are the results of my tests:

## Sonatype Nexus 2

Works perfectly and the container starts up quickly (under 10 seconds):

![ss_aci_sonatypenexus2](/assets/images/blog/ss_aci_sonatypenexus2.png)

I passed the following parameters to the script:

```powershell
.\Install-AzureContainerInstancePersistStorage.ps1 `
    -ServicePrincipalUsername 'ce6fca5e-a22d-44b2-a75a-f3b20fcd1b16' `
    -ServicePrincipalPassword (ConvertTo-SecureString -String 'JUJfenwe89hwNNF723ibw2YBybf238ybflA=' -AsPlainText -Force) `
    -TenancyId '8871b1ba-7d3d-45f3-8ee0-bb60c0e4733e' `
    -SubscriptionName 'Visual Studio Enterprise' `
    -AppCode 'nexus' `
    -UniqueCode 'mine' `
    -ContainerImage 'sonatype/nexus:oss' `
    -ContainerPort '8081' `
    -VolumeName 'nexus' `
    -MountPoint '/sonatype-work/' `
    -Verbose
```

_**Note: The Nexus 2 server is only accessible on the path /nexus/.**_

## Sonatype Nexus 3

Works perfectly but after takes at least a minute to be accessible after the container starts. But this is normal behavior for Nexus 3.

![ss_aci_sonatypenexus3](/assets/images/blog/ss_aci_sonatypenexus3.png)

I passed the following parameters to the script:

```powershell
.\Install-AzureContainerInstancePersistStorage.ps1 `
    -ServicePrincipalUsername 'ce6fca5e-a22d-44b2-a75a-f3b20fcd1b16' `
    -ServicePrincipalPassword (ConvertTo-SecureString -String 'JUJfenwe89hwNNF723ibw2YBybf238ybflA=' -AsPlainText -Force) `
    -TenancyId '8871b1ba-7d3d-45f3-8ee0-bb60c0e4733e' `
    -SubscriptionName 'Visual Studio Enterprise' `
    -AppCode 'nexus3' `
    -UniqueCode 'mine' `
    -ContainerImage 'sonatype/nexus3:latest' `
    -ContainerPort '8081' `
    -VolumeName 'nexus3' `
    -MountPoint '/nexus-data/' `
    -Verbose
```

## Jenkins

Unfortunately Jenkins does not work with a persistent storage volume from an Azure Share. It seems to be trying to set the timestamp of the file that will contain the InitialAdminPassword, which is failing:

![ss_aci_jenkins](/assets/images/blog/ss_aci_jenkins.png)

I passed the following parameters to the script:

```powershell
.\Install-AzureContainerInstancePersistStorage.ps1 `
    -ServicePrincipalUsername 'ce6fca5e-a22d-44b2-a75a-f3b20fcd1b16' `
    -ServicePrincipalPassword (ConvertTo-SecureString -String 'JUJfenwe89hwNNF723ibw2YBybf238ybflA=' -AsPlainText -Force) `
    -TenancyId '8871b1ba-7d3d-45f3-8ee0-bb60c0e4733e' `
    -SubscriptionName 'Visual Studio Enterprise' `
    -AppCode 'jenkinshome' `
    -UniqueCode 'dsr' `
    -ContainerImage 'jenkins/jenkins:lts' `
    -ContainerPort '8080' `
    -VolumeName 'jenkinshome' `
    -MountPoint '/var/jenkins_home/' `
    -Verbose
```

So, this is still a little bit hit and miss, but in general Azure Container Instances look like a very promising way to run different types of services in containers without a lot of overhead. With a bit of automation, this could turn out to be a cost effective way to quickly and easily run some common services.
