import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
});

const customBucketName = "s3-t-uw2-aws-amplify-s3-storage-browser";
const customBucketRegion = "us-west-2";

backend.addOutput({
  version: "1.3",
  storage: {
    aws_region: customBucketRegion,
    bucket_name: customBucketName,
    buckets: [
      {
        name: customBucketName,
        bucket_name: customBucketName,
        aws_region: customBucketRegion,
        //@ts-expect-error amplify backend type issue
        paths: {
          "*": {
            authenticated: ["get", "list", "write", "delete"],
          },
        },
      },
    ],
  },
});

const unauthPolicy = new Policy(backend.stack, "customBucketUnauthPolicy", {
  statements: [],
});

const authPolicy = new Policy(backend.stack, "customBucketAuthPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      resources: [`arn:aws:s3:::${customBucketName}/*`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [`arn:aws:s3:::${customBucketName}`],
    }),
  ],
});

const adminPolicy = new Policy(backend.stack, "customBucketAdminPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      resources: [`arn:aws:s3:::${customBucketName}/*`],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["s3:ListBucket"],
      resources: [`arn:aws:s3:::${customBucketName}`],
    }),
  ],
});

backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(
  unauthPolicy
);

backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(authPolicy);

backend.auth.resources.groups["admin"].role.attachInlinePolicy(adminPolicy);
