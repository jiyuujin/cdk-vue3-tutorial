import * as cdk from '@aws-cdk/core';

import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as iam from '@aws-cdk/aws-iam';
import * as cloudfront from '@aws-cdk/aws-cloudfront';

export class CdkVue3TutorialStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const testBucket = new s3.Bucket(this, `TheNewBucketID-${this.stackName}`, {
      bucketName: 'nekohack-cdk-vue3-tutorial',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
    });

    new s3Deploy.BucketDeployment(this, 'DeployWebsite',{
      sources: [s3Deploy.Source.asset('../dist')],
      destinationBucket: testBucket
    });

    const oai = new cloudfront.OriginAccessIdentity(
      this,
      `identity-${this.stackName}`
    );
    const myBucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      principals: [
        new iam.CanonicalUserPrincipal(
          oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
        )
      ],
      resources: [testBucket.bucketArn + '/*']
    });
    testBucket.addToResourcePolicy(myBucketPolicy);

    new cloudfront.CloudFrontWebDistribution(this, 'WebsiteDistribution', {
      viewerCertificate: {
        aliases: [],
        props: {
          cloudFrontDefaultCertificate: true
        }
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: testBucket,
            originAccessIdentity: oai
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.days(365),
              defaultTtl: cdk.Duration.days(1),
              pathPattern: '../out/*'
            }
          ]
        }
      ],
      errorConfigurations: [
        {
          errorCode: 403,
          responsePagePath: '/index.html',
          responseCode: 200,
          errorCachingMinTtl: 0
        },
        {
          errorCode: 404,
          responsePagePath: '/index.html',
          responseCode: 200,
          errorCachingMinTtl: 0
        }
      ]
    });
  }
}
