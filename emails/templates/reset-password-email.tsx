import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

type TResetPasswordEmailProps = {
  name: string
  resetPasswordUrl: string
}

export default function ResetPasswordEmail({
  name = 'Usuario',
  resetPasswordUrl = 'https://example.com/reset-password',
}: TResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Restablece tu contraseña de Trello Clone</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Restablecer Contraseña</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hola {name},</Text>
            <Text style={paragraph}>
              Recibimos una solicitud para restablecer la contraseña de tu
              cuenta de Trello Clone. Si no realizaste esta solicitud, puedes
              ignorar este mensaje con toda seguridad.
            </Text>

            <Text style={paragraph}>
              Para restablecer tu contraseña, haz clic en el siguiente botón:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetPasswordUrl}>
                Restablecer mi contraseña
              </Button>
            </Section>

            <Text style={warningText}>
              <strong>Importante:</strong> Este enlace expirará en 1 hora por
              motivos de seguridad.
            </Text>

            <Text style={footerText}>
              ¡Gracias!
              <br />
              El equipo de Trello Clone
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerLink}>
              Si el botón no funciona, copia y pega este enlace en tu navegador:
            </Text>
            <Text style={link}>{resetPasswordUrl}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles based on the app's design system from globals.css
const main = {
  backgroundColor: '#f7f6f2',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#fffffb',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  border: '1px solid #eae8e1',
}

const header = {
  backgroundColor: '#7f6a3f',
  padding: '32px 24px',
  borderRadius: '8px 8px 0 0',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '0 48px',
}

const paragraph = {
  color: '#22211f',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const buttonContainer = {
  padding: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#7f6a3f',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  cursor: 'pointer',
}

const warningText = {
  color: '#716e65',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
}

const footerText = {
  color: '#716e65',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '24px 0 0',
}

const footer = {
  padding: '24px 48px',
  borderTop: '1px solid #eae8e1',
  marginTop: '32px',
}

const footerLink = {
  color: '#716e65',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const link = {
  color: '#7f6a3f',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
  margin: '0',
}
