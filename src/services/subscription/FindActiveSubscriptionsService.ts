interface IActiveSubscription {
  subscriptionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  discordUserId: string;
}

export default class FindActiveSubscriptionsService {
  public async execute(): Promise<IActiveSubscription[]> {
    const activeSubscriptions = [
      {
        subscriptionId: '1',
        customerId: '1',
        customerName: 'Test user 1',
        customerEmail: 'test_user1@test.com',
        discordUserId: '1111',
      },
      {
        subscriptionId: '2',
        customerId: '2',
        customerName: 'Test user 2',
        customerEmail: 'test_user2@test.com',
        discordUserId: '22222',
      },
    ];

    return activeSubscriptions;
  }
}
