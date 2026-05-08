import admin from "firebase-admin";
import { resolve } from "path";
import fs from "node:fs";

class fireBaseServices {
  private readonly _client?: admin.app.App;
  constructor() {
    const path = resolve("social-media-app-66b81-firebase-adminsdk-fbsvc-9b5231dc47.json");
    if (fs.existsSync(path)) {
      this._client = admin.initializeApp({
        credential: admin.credential.cert(path),
      });
    }
  }

  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {
    if (!this._client) {
      throw new Error("Firebase credentials are not configured");
    }
    const message = { token, data };
    return await this._client.messaging().send(message);
  }

  async sendNotifications({ tokens }: { tokens: string[] }) {
    const data = {
      title: "login alert",
      body: `there is a device the logged-in to your account in ${Date.now()}`,
    };

    await Promise.all(
      tokens.map((token) => {
        const message = { token , data }
        this.sendNotification({token , data })
      }),
    );
  }
}

export default new fireBaseServices();
