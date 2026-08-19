import * as React from 'react'

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

import type { TemplateEntry } from './registry'

interface WelcomeEmailProps {
  username?: string
  siteUrl?: string
}

const WelcomeEmail = ({
  username,
  siteUrl = 'https://solisfantasy.com',
}: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Solis-Fantasy — who knows ball?</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>SOLIS-FANTASY</Text>
        <Heading style={h1}>WHO KNOWS BALL?</Heading>
        <Text style={text}>
          {username ? `Welcome, ${username}.` : 'Welcome.'} Your account is live. Solis-Fantasy is
          free-to-play — no real money, just points, bragging rights, and receipts.
        </Text>
        <Section style={list}>
          <Text style={item}>1. Build a straight bet or a parlay from the slate.</Text>
          <Text style={item}>2. Join a private league with an invite code, or browse public leagues.</Text>
          <Text style={item}>3. Track your tickets live and climb the weekly standings.</Text>
        </Section>
        <Button style={button} href={`${siteUrl}/home`}>
          Make your first pick
        </Button>
        <Text style={footer}>
          You're getting this because you created a Solis-Fantasy account.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to Solis-Fantasy — who knows ball?',
  displayName: 'Welcome',
  previewData: { username: 'ballknower', siteUrl: 'https://solisfantasy.com' },
} satisfies TemplateEntry

export default WelcomeEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = {
  padding: '32px 28px',
  backgroundColor: '#121c2e',
  borderRadius: '14px',
  maxWidth: '520px',
  border: '1px solid #223154',
  margin: '24px auto',
}
const brand = {
  fontSize: '11px',
  letterSpacing: '2px',
  color: '#f59043',
  margin: '0 0 12px',
  fontWeight: 'bold' as const,
}
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 18px' }
const text = { fontSize: '14px', color: '#c3cbdb', lineHeight: '1.6', margin: '0 0 20px' }
const list = { margin: '0 0 24px' }
const item = { fontSize: '14px', color: '#c3cbdb', lineHeight: '1.6', margin: '0 0 8px' }
const button = {
  backgroundColor: '#f2751f',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
}
const footer = { fontSize: '12px', color: '#8794ad', margin: '30px 0 0' }
