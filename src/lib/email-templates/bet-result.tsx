import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import type { TemplateEntry } from './registry'

interface BetResultEmailProps {
  username?: string
  won?: boolean
  betType?: string
  oddsLabel?: string
  pointsDelta?: number
  legs?: string[]
  leagueName?: string | null
  siteUrl?: string
}

const BetResultEmail = ({
  username,
  won = true,
  betType = 'parlay',
  oddsLabel = '+450',
  pointsDelta = 450,
  legs = [],
  leagueName = null,
  siteUrl = 'https://solisfantasy.com',
}: BetResultEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {won
        ? `Your ${betType} cashed for ${pointsDelta} points`
        : `Bad beat — your ${betType} went down`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>SOLIS-FANTASY</Text>
        <Heading style={h1}>{won ? 'IT CASHED.' : 'BAD BEAT.'}</Heading>
        <Text style={text}>
          {username ? `${username}, your ` : 'Your '}
          {betType} at {oddsLabel} {won ? 'hit' : 'lost'}
          {leagueName ? ` in ${leagueName}` : ''}.
        </Text>

        <Section style={won ? deltaBoxGood : deltaBoxBad}>
          <Text style={won ? deltaGood : deltaBad}>
            {pointsDelta > 0 ? `+${pointsDelta}` : `${pointsDelta}`} pts
          </Text>
        </Section>

        {legs.length ? (
          <>
            <Hr style={hr} />
            <Text style={sectionTitle}>The ticket</Text>
            {legs.map((leg, i) => (
              <Text key={i} style={legText}>
                • {leg}
              </Text>
            ))}
          </>
        ) : null}

        <Button style={button} href={`${siteUrl}/stats`}>
          {won ? 'Share the ticket' : 'See your season stats'}
        </Button>
        <Text style={footer}>
          Solis-Fantasy is free-to-play. No real money is involved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BetResultEmail,
  subject: (data: Record<string, any>) =>
    data['won']
      ? `It cashed — ${data['oddsLabel'] ?? 'your bet'} hit for ${data['pointsDelta'] ?? 0} pts`
      : `Bad beat — your ${data['betType'] ?? 'bet'} went down`,
  displayName: 'Bet result',
  previewData: {
    username: 'ballknower',
    won: true,
    betType: '3-leg parlay',
    oddsLabel: '+650',
    pointsDelta: 650,
    legs: ['Chiefs -3.5 (-110)', 'Bills ML (+120)', 'Mahomes 250+ yds (-115)'],
    leagueName: 'Sunday Scaries',
  },
} satisfies TemplateEntry

export default BetResultEmail

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
const h1 = { fontSize: '26px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 14px' }
const text = { fontSize: '14px', color: '#c3cbdb', lineHeight: '1.6', margin: '0 0 18px' }
const deltaBoxGood = {
  backgroundColor: '#10261e',
  border: '1px solid #1f5c46',
  borderRadius: '10px',
  padding: '18px',
  textAlign: 'center' as const,
}
const deltaBoxBad = {
  backgroundColor: '#2a1417',
  border: '1px solid #6b2730',
  borderRadius: '10px',
  padding: '18px',
  textAlign: 'center' as const,
}
const deltaGood = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#3ddc97',
  margin: '0',
}
const deltaBad = { fontSize: '28px', fontWeight: 'bold' as const, color: '#ff6b6b', margin: '0' }
const hr = { borderColor: '#223154', margin: '22px 0' }
const sectionTitle = {
  fontSize: '12px',
  letterSpacing: '1px',
  color: '#8794ad',
  margin: '0 0 10px',
  fontWeight: 'bold' as const,
}
const legText = { fontSize: '13px', color: '#c3cbdb', margin: '0 0 6px' }
const button = {
  backgroundColor: '#f2751f',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
  marginTop: '22px',
}
const footer = { fontSize: '12px', color: '#8794ad', margin: '28px 0 0' }
