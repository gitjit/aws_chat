# aws_chat
A mini project incorporating AWS features like Lambda, Dynamo, S3, CloudFront and Cognito.

## Setting up a Lambda Function  

In this project, I am using Node.JS runtime. We have specified two roles for our Lambda.
We have created an S3 Policy (GetObject), which basically allows to read from a specific bucket. 
Then we created a Role that targets Lambda and add above S3 policy we created and LambdaBasicExecution policy(Allows to write to cloudwatch);

Then we creates a Lambda Function. 

![](img/2020-08-11-16-30-54.png)

## Setting up API Gateway  

Once your Lambda function is ready. Create your API Gateway.  Select the REST API. 

![](img/2020-08-11-16-54-20.png)

![](img/2020-08-11-16-55-22.png)

Now Actions -> Create Resource and enable proxy. (Proxy means we will get the entire request to Lambda from API Gateway).

![](img/2020-08-11-16-57-44.png)

Now associate your API with Lambda.  

![](img/2020-08-11-16-58-32.png)  

You can test it with specify proxy path in the test.  

![](img/2020-08-11-17-01-40.png)  

![](img/2020-08-11-17-02-17.png) 

Now enable CORS  

![](img/2020-08-11-17-09-31.png)  

Now ensure to deploy your API.  (Actions -> Deploy)

![](img/2020-08-11-17-13-01.png)

You will get the API URL from stages section.  

![](img/2020-08-11-17-15-24.png)  

![](img/2020-08-16-19-25-16.png)

## Adding Cognito Support  

## References  

[https://learning.oreilly.com/videos/build-a-serverless/9781789348149/9781789348149-video1_1
](https://learning.oreilly.com/videos/build-a-serverless/9781789348149/9781789348149-video1_1)
