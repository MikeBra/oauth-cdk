import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
interface APIGatewayProxyEventWithCookies extends APIGatewayProxyEvent {
    cookies?: string[];
}
export declare const handler: (event: APIGatewayProxyEventWithCookies) => Promise<APIGatewayProxyResult>;
export {};
