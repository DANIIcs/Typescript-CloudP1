import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class Proyecto1Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        const synthesizer = new cdk.DefaultStackSynthesizer({
            fileAssetsBucketName: "proyecto-cloud",  // Tu bucket
            bucketPrefix: "",
            cloudFormationExecutionRole: "arn:aws:iam::298526054328:role/LabRole",  // Tu IAM Role
            deployRoleArn: "arn:aws:iam::298526054328:role/LabRole",
            fileAssetPublishingRoleArn: "arn:aws:iam::298526054328:role/LabRole",
            imageAssetPublishingRoleArn: "arn:aws:iam::298526054328:role/LabRole"
        });

        // Combina props con synthesizer
        super(scope, id, {
            synthesizer: synthesizer,
            ...props
        });

        // VPC existente
        const vpc = ec2.Vpc.fromLookup(this, "MyVpc", { vpcId: "vpc-05190e608cebfb9be" });  // Tu VPC ID

        // IAM Role existente
        const instanceRole = iam.Role.fromRoleArn(this, "LabRole", "arn:aws:iam::298526054328:role/LabRole");

        // Usar LookupMachineImage para encontrar la última imagen de Ubuntu
        const ubuntuAmi = new ec2.LookupMachineImage({
            name: "ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*",
            owners: ["099720109477"]  // Propietario de Ubuntu
        });

        // Crear una instancia con los parámetros personalizados
        const instance = new ec2.Instance(this, "WebServerProyecto1", {
            instanceType: new ec2.InstanceType("t3.micro"),  // Cambié t2.micro a t3.micro para mejorar el rendimiento
            machineImage: ubuntuAmi,
            vpc: vpc,
            role: instanceRole
        });

        // Comandos de UserData
        const userDataCommands = [
            "apt-get update -y",
            "apt-get install -y git",
            "git clone https://github.com/DANIIcs/websimple.git",
            "git clone https://github.com/DANIIcs/webplantilla.git",
            "cd websimple",
            "nohup python3 -m http.server 8080 &",
            "cd ../webplantilla",
            "nohup python3 -m http.server 8081 &"
        ];

        // Añadir los comandos de UserData
        userDataCommands.forEach(cmd => instance.userData.addCommands(cmd));

        // Permitir tráfico HTTP en los puertos 8080 y 8081 desde cualquier IPv4
        instance.connections.allowFromAnyIpv4(ec2.Port.tcp(8080), "Allow HTTP traffic on port 8080");
        instance.connections.allowFromAnyIpv4(ec2.Port.tcp(8081), "Allow HTTP traffic on port 8081");
    }
}
