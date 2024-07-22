import { CognitoUserPool } from 'amazon-cognito-identity-js';

const customerPoolData = {
  UserPoolId: "us-east-1_ws9SY6BSb",
  ClientId: "go7kiu26bjkovon6ofre63b4g"
};

const agentPoolData = {
  UserPoolId: "us-east-1_X9xaDUA59",
  ClientId: "6io8dliu6684pjluemn1hf41da"
};

const customerUserPool = new CognitoUserPool(customerPoolData);
const agentUserPool = new CognitoUserPool(agentPoolData);

const getUserPool = (role) => {
  return role === 'agent' ? agentUserPool : customerUserPool;
};

export { customerUserPool, agentUserPool, getUserPool };
