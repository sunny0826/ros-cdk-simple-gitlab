import * as ros from '@alicloud/ros-cdk-core';
import * as ecs from '@alicloud/ros-cdk-ecs';
import * as ROS from '@alicloud/ros-cdk-ros';

export class RosCdkSimpleGitlabStack extends ros.Stack {
  constructor(scope: ros.Construct, id: string, props?: ros.StackProps) {
    super(scope, id, props);
    new ros.RosInfo(this, ros.RosInfo.description, "This is the simple ros cdk app example.");
    // The code that defines your stack goes here
     // 下载 GItLab 地址
     let GitLabDownloadUrl = 'https://omnibus.gitlab.cn/el/7/gitlab-jh-13.12.4-jh.0.el7.x86_64.rpm'
     // 本地 IP，用于安全组
     let YourIpAddress = '101.224.119.124'
     // 安全组开放的端口
     let PortList = ['22', '3389', '80']
     // ECS 密码，用于 SSH 登录
     let YourPass = 'eJXuYnNT6LD4PS'
     // URL 地址，用于访问安装好的 GitLab
     let ExternalUrl = 'http://jh.gxd'
     
 
     // 构建 VPC
     const vpc = new ecs.Vpc(this, 'vpc-from-ros-cdk', {
       vpcName: 'test-jh-gitlab',
       cidrBlock: '10.0.0.0/8',
       description: 'test jh gitlab'
     });
 
     // 构建 VSwitch
     const vsw = new ecs.VSwitch(this,'vsw-from-ros-cdk',{
       vpcId: vpc.attrVpcId,
       zoneId: 'cn-shanghai-b',
       vSwitchName: 'test-jh-gitlab-vsw',
       cidrBlock:'10.0.0.0/16',
     })
 
     // 构建安全组
     const sg = new ecs.SecurityGroup(this, 'ros-cdk-gitlab-sg', {
       vpcId: vpc.attrVpcId,
       securityGroupName: 'test-jh-gitlab-sg',
     })
 
     // 为安全组增加记录
     for (let port of PortList) {
       new ecs.SecurityGroupIngress(this, `ros-cdk-sg-ingree-${port}`, {
         portRange: `${port}/${port}`,
         nicType: 'intranet',
         sourceCidrIp: `${YourIpAddress}`,
         ipProtocol: 'tcp',
         securityGroupId: sg.attrSecurityGroupId,
       }, true)
     }
 
     // 等待逻辑，用于等待 ECS 中应用安装完成
     const ecsWaitConditionHandle = new ROS.WaitConditionHandle(this, 'RosWaitConditionHandle', {
       count: 1
     })
 
     const ecsWaitCondition = new ROS.WaitCondition(this, 'RosWaitCondition', {
       timeout: 1200,
       handle: ros.Fn.ref('RosWaitConditionHandle'),
       count: 1
     })
 
     // 构建 ECS
     const git_ecs = new ecs.Instance(this, 'ecs-form-ros-cdk', {
       vpcId: vpc.attrVpcId,
       vSwitchId: vsw.attrVSwitchId,
       imageId: 'centos_7',
       securityGroupId: sg.attrSecurityGroupId,
       instanceType: 'ecs.g7.xlarge',
       instanceName: 'jh-gitlab-ros',
       systemDiskCategory: 'cloud_essd',
       password: `${YourPass}`,
       userData: ros.Fn.replace({ NOTIFY: ecsWaitConditionHandle.attrCurlCli }, `#!/bin/bash
       sudo yum install -y curl policycoreutils-python openssh-server perl
       sudo systemctl enable sshd
       sudo systemctl start sshd
       sudo firewall-cmd --permanent --add-service=http
       sudo firewall-cmd --permanent --add-service=https
       sudo systemctl reload firewalld
 
       sudo firewall-cmd --permanent --add-service=http
       sudo firewall-cmd --permanent --add-service=https
       sudo systemctl reload firewalld
 
       sudo yum install postfix
       sudo systemctl enable postfix
       sudo systemctl start postfix
 
       wget ${GitLabDownloadUrl}
 
       sudo EXTERNAL_URL=${ExternalUrl} rpm -Uvh gitlab-jh-13.12.4-jh.0.el7.x86_64.rpm
 
       NOTIFY
       `),
     })
 
     // 输出，将构建 ECS 的公网 IP 输出在 ROS Stack 中
     new ros.RosOutput(this, 'ips-output', {
       description: 'ipAddress',
       value: git_ecs.attrPublicIp,
     })
   }
  }