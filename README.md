# bdCalling Interview process

# All methods are POST

## base url => http://192.168.10.70:3010/api/v1

## create user => url: http://192.168.10.70:3010/api/v1/user/create-user

method: POST,
data need send with form-data
Input=>
data ={
"name": "user",
"email": "abdulsatter.ism@gmail.com",
"phone": "+1234567890",
"password": "12345678"
}

and
send image with file , file name = image and formate => png, jpeg or jpg (formate)

# Output=>

    {
    "success": true,
    "message": "Please check your email to verify your account."

}

## verify email => url: http://192.168.10.70:3010/api/v1/auth/verify-email

method: POST,
send email and oneTimeCode for verify email. oneTimeCode is number
Input=>
body :{
"email": "abdulsatter.ism@gmail.com",
"oneTimeCode":583174
}

Output=>
{
"success": true,
"message": "Your email has been successfully verified. Your account is now fully activated.",
"data": {
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODM1MGNmMmQ2ODlhZjljYzQ3ZGFmMSIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJhYmR1bHNhdHRlci5pc21AZ21haWwuY29tIiwiaWF0IjoxNzM2NjU5MTk5LCJleHAiOjE3MzkyNTExOTl9.HRBhhmwaaVUYNKiGoT5p_1-W8mz0qKFofF3lIfAfsHs",
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODM1MGNmMmQ2ODlhZjljYzQ3ZGFmMSIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJhYmR1bHNhdHRlci5pc21AZ21haWwuY29tIiwiaWF0IjoxNzM2NjU5MTk5LCJleHAiOjE3NjgxOTUxOTl9.adfuWcTa2PahcMOE3N6fFmiXfxrxJLB_DP-DpvSGLEI"
}
}

## Login user => url: http://192.168.10.70:3010/api/v1/auth/login

method: POST,
send email and password, password will be string
Input=>
body :{
"email": "abdulsatter.ism@gmail.com",
"password": "12345678"
}

Output=>
{
"success": true,
"message": "User login successfully",
"data": {
"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODM1MGNmMmQ2ODlhZjljYzQ3ZGFmMSIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJhYmR1bHNhdHRlci5pc21AZ21haWwuY29tIiwiaWF0IjoxNzM2NjU5MjE5LCJleHAiOjE3MzkyNTEyMTl9.mlusij1b9NZaQHaDcZvXrKHIQiSMB22qe1fUNI66ifs",
"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODM1MGNmMmQ2ODlhZjljYzQ3ZGFmMSIsInJvbGUiOiJVU0VSIiwiZW1haWwiOiJhYmR1bHNhdHRlci5pc21AZ21haWwuY29tIiwiaWF0IjoxNzM2NjU5MjE5LCJleHAiOjE3NjgxOTUyMTl9.R472lWcgFwncGGEJAz2su94tsqZdOGE0ClmfnwsEo70"
}
}
