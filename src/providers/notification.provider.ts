import { SES, SNS } from "aws-sdk";

interface PaymentNotificationParams {
  userEmail: string;
  userPhone?: string;
  paymentId: string;
  paymentUrl: string;
  amount: number;
  saleId: number;
}

const ses = new SES({ region: process.env.AWS_REGION });
const sns = new SNS({ region: process.env.AWS_REGION });

export async function sendPaymentNotification(
  params: PaymentNotificationParams
): Promise<void> {
  try {
    // Enviar e-mail via SES
    const emailParams: SES.SendEmailRequest = {
      Source: process.env.SES_VERIFIED_EMAIL!,
      Destination: { ToAddresses: [params.userEmail] },
      Message: {
        Subject: {
          Data: `Confirme seu pagamento - Venda #${params.saleId}`,
        },
        Body: {
          Html: {
            Data: `
            <html>
              <body>
                <h1>ID do Pagamento: ${params.paymentId}</h1>
                <h1>Pagamento pendente: R$ ${(params.amount / 100).toFixed(
                  2
                )}</h1>
                <p>Clique para confirmar: <a href="${
                  params.paymentUrl
                }">Efetuar Pagamento</a></p>
                <p>Reserva ID: ${params.saleId}</p>
              </body>
            </html>
          `,
          },
        },
      },
    };

    // Enviar SMS via SNS (se número disponível)
    if (params.userPhone) {
      const smsParams: SNS.PublishInput = {
        PhoneNumber: params.userPhone,
        Message: `Confirme seu pagamento de R$ ${(params.amount / 100).toFixed(
          2
        )}: ${params.paymentUrl}`,
      };

      await sns.publish(smsParams).promise();
    }

    await ses.sendEmail(emailParams).promise();
  } catch (error: any) {}
}

interface PaymentResultNotificationParams {
  userEmail: string;
  userPhone?: string;
  status: "PAID" | "FAILED";
  amount: number;
  saleId: number;
  paymentId: string;
  failureReason?: string;
}

export async function sendPaymentResultNotification(
  params: PaymentResultNotificationParams
): Promise<void> {
  try {
    // Configurar conteúdo dinâmico
    const [subject, smsMessage, emailBody] =
      params.status === "PAID"
        ? [
            `Pagamento confirmado - Reserva #${params.saleId}`,
            `✅ Pagamento de R$ ${(params.amount / 100).toFixed(
              2
            )} aprovado! ID: ${params.paymentId}`,
            `<h1>Pagamento Confirmado!</h1><p>ID: ${params.paymentId}</p>`,
          ]
        : [
            `Falha no pagamento - Reserva #${params.saleId}`,
            `❌ Pagamento falhou: ${
              params.failureReason || "Motivo não especificado"
            }. ID: ${params.paymentId}`,
            `<h1>Pagamento Não Processado</h1><p>Motivo: ${params.failureReason}</p>`,
          ];

    // Enviar e-mail via SES
    await ses
      .sendEmail({
        Source: process.env.SES_VERIFIED_EMAIL!,
        Destination: { ToAddresses: [params.userEmail] },
        Message: {
          Subject: { Data: subject },
          Body: {
            Html: {
              Data: `
          <html>
            <body>
              ${emailBody}
              <p>Valor: R$ ${(params.amount / 100).toFixed(2)}</p>
              <p>Reserva ID: ${params.saleId}</p>
            </body>
          </html>
        `,
            },
          },
        },
      })
      .promise();

    // Enviar SMS via SNS
    if (params.userPhone) {
      await sns
        .publish({
          PhoneNumber: params.userPhone,
          Message: smsMessage,
        })
        .promise();
    }
  } catch (error: any) {}
}
