import { Injectable, Logger } from '@nestjs/common';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PushService {
  private expo: Expo;
  private readonly logger = new Logger(PushService.name);

  constructor(private prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { pushToken: true },
      });

      // Save notification to database for in-app viewing
      await this.prisma.notification.create({
        data: {
          userId,
          message: body,
        }
      });

      if (!user || !user.pushToken) {
        this.logger.warn(`No push token found for user ${userId}`);
        return;
      }

      if (!Expo.isExpoPushToken(user.pushToken)) {
        this.logger.error(`Push token ${user.pushToken} is not a valid Expo push token`);
        return;
      }

      const messages: ExpoPushMessage[] = [
        {
          to: user.pushToken,
          sound: 'default',
          title,
          body,
          data: data || {},
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          this.logger.error('Error sending push notification chunk:', error);
        }
      }

      this.logger.log(`Successfully sent push notification to user ${userId}`);
      return tickets;
    } catch (error) {
      this.logger.error('Failed to send push notification', error);
    }
  }
}
