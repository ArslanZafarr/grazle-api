import { fcm } from "./firebase";

export const sendPushNotifications = async (
  tokens: string[],
  title: string,
  body: string,
  data: any
) => {
  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens,
  };

  try {
    const response = await fcm.sendEachForMulticast(message);
    console.log("Successfully sent messages:", response);
  } catch (error) {
    console.log("Error sending messages:", error);
  }
};

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  data: any
) => {
  const message = {
    notification: {
      title,
      body,
    },
    data,
    token, // Send notification to a single token
  };

  try {
    const response = await fcm.send(message);

    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
