import { EmailClient } from "@azure/communication-email";

// Initialize the Email Client


const connectionString = process.env.AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING || '';
const emailClient = new EmailClient(connectionString);


export async function sendEmail(to: string, subject: string, htmlContent: string) {

  const message = {
    senderAddress: "DoNotReply@mail.crazyfaceai.co",
    content: {
      subject,
      html: htmlContent,
    },
    recipients: {
      to: [
        {
          address: to,
        },
      ],
    },
  };

  const poller = await emailClient.beginSend(message);
  const result = await poller.pollUntilDone();

  while (!poller.getOperationState().isCompleted) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('Email sent successfully to ' + to, 'subject: ' + subject, 'content: ' + htmlContent.slice(0, 100) + '...');

  return result;

}