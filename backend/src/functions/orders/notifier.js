import { SendEmailCommand } from "@aws-sdk/client-sesv2";

function formatMoney(minorUnits, currency) {
  return `${(minorUnits / 100).toFixed(2)} ${currency}`;
}

function orderEmail(order) {
  const items = order.items
    .map(
      (item) =>
        `- ${item.name} | size ${item.size} | quantity ${item.quantity} | ${formatMoney(item.lineTotalMinor, order.currency)}`,
    )
    .join("\n");
  const address = order.address;

  return [
    `New order: ${order.orderId}`,
    `Created: ${order.createdAt}`,
    "",
    items,
    "",
    `Subtotal: ${formatMoney(order.subtotalMinor, order.currency)}`,
    `Delivery: ${formatMoney(order.deliveryFeeMinor, order.currency)}`,
    `Total: ${formatMoney(order.totalMinor, order.currency)}`,
    "",
    "Delivery contact:",
    `${address.firstName} ${address.lastName}`,
    address.email,
    address.phone,
    `${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`,
  ].join("\n");
}

export function createOrderNotifier({ sesClient, sourceEmail, sellerEmail }) {
  if (!sesClient?.send) throw new Error("An SES client is required.");
  if (!sourceEmail) throw new Error("SES_SOURCE_EMAIL is required.");
  if (!sellerEmail) throw new Error("SELLER_NOTIFICATION_EMAIL is required.");

  return {
    async send(order) {
      await sesClient.send(
        new SendEmailCommand({
          FromEmailAddress: sourceEmail,
          Destination: { ToAddresses: [sellerEmail] },
          Content: {
            Simple: {
              Subject: { Data: `New order ${order.orderId}`, Charset: "UTF-8" },
              Body: {
                Text: { Data: orderEmail(order), Charset: "UTF-8" },
              },
            },
          },
        }),
      );
    },
  };
}
