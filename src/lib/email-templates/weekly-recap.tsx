import * as React from 'react'

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

import type { TemplateEntry } from './registry'

export interface RecapStanding {
  username: string
  points: number
  wins: number
  losses: number
  isYou?: boolean
}

interface WeeklyRecapEmailProps {
  username?: string
  leagueName?: string
  weekLabel?: string
  yourRank?: number
  memberCount?: number
  yourPoints?: number
  yourWins?: number
  yourLosses?: number
  yourPending?: number
  betsUsed?: number
  betLimit?: number
  standings?: RecapStanding[]
  bestBet?: string | null
  worstBet?: string | null
  siteUrl?: string
}

const ord = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const WeeklyRecapEmail = ({
  username,
  leagueName = 'Your League',
  weekLabel = 'this week',
  yourRank = 1,
  memberCount = 1,
  yourPoints = 0,
  yourWins = 0,
  yourLosses = 0,
  yourPending = 0,
  betsUsed = 0,
  betLimit = 0,
  standings = [],
  bestBet = null,
  worstBet = null,
  siteUrl = 'https://solisfantasy.com',
}: WeeklyRecapEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${leagueName}: you're ${ord(yourRank)} of ${memberCount}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>SOLIS-FANTASY WEEKLY RECAP</Text>
        <Heading style={h1}>{leagueName}</Heading>
        <Text style={text}>
          {username ? `${username}, here's` : "Here's"} your {weekLabel} in {leagueName}.
        </Text>

        <Section style={statBox}>
          <Row>
            <Column style={statCol}>
              <Text style={statValue}>{ord(yourRank)}</Text>
              <Text style={statLabel}>of {memberCount}</Text>
            </Column>
            <Column style={statCol}>
              <Text style={statValue}>
                {yourPoints > 0 ? `+${yourPoints}` : `${yourPoints}`}
              </Text>
              <Text style={statLabel}>points</Text>
            </Column>
            <Column style={statCol}>
              <Text style={statValue}>
                {yourWins}-{yourLosses}
              </Text>
              <Text style={statLabel}>{yourPending} pending</Text>
            </Column>
          </Row>
        </Section>

        {betLimit > 0 ? (
          <Text style={muted}>
            You used {betsUsed} of {betLimit} bets this week.
          </Text>
        ) : null}

        {bestBet ? (
          <Text style={text}>
            <span style={good}>Best hit:</span> {bestBet}
          </Text>
        ) : null}
        {worstBet ? (
          <Text style={text}>
            <span style={bad}>Worst beat:</span> {worstBet}
          </Text>
        ) : null}

        <Hr style={hr} />
        <Text style={sectionTitle}>Standings</Text>
        {standings.map((row, i) => (
          <Row key={`${row.username}-${i}`} style={row.isYou ? standRowYou : standRow}>
            <Column style={rankCol}>
              <Text style={row.isYou ? standTextYou : standText}>{i + 1}</Text>
            </Column>
            <Column>
              <Text style={row.isYou ? standTextYou : standText}>
                {row.username}
                {row.isYou ? ' (you)' : ''}
              </Text>
            </Column>
            <Column style={ptsCol}>
              <Text style={row.isYou ? standTextYou : standText}>
                {row.points > 0 ? `+${row.points}` : row.points} · {row.wins}-{row.losses}
              </Text>
            </Column>
          </Row>
        ))}

        <Button style={button} href={`${siteUrl}/groups`}>
          See the full league
        </Button>
        <Text style={footer}>
          Solis-Fantasy is free-to-play. No real money is involved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WeeklyRecapEmail,
  subject: (data: Record<string, any>) =>
    `${data['leagueName'] ?? 'Your league'} recap — you're ${ord(Number(data['yourRank'] ?? 1))}`,
  displayName: 'Weekly league recap',
  previewData: {
    username: 'ballknower',
    leagueName: 'Sunday Scaries',
    weekLabel: 'week of Aug 17',
    yourRank: 2,
    memberCount: 6,
    yourPoints: 145,
    yourWins: 3,
    yourLosses: 2,
    yourPending: 1,
    betsUsed: 6,
    betLimit: 8,
    bestBet: '4-leg parlay +1200 (+1200 pts)',
    worstBet: 'Chiefs -3.5 (-100 pts)',
    standings: [
      { username: 'jaymo', points: 210, wins: 4, losses: 1 },
      { username: 'ballknower', points: 145, wins: 3, losses: 2, isYou: true },
      { username: 'parlaypat', points: -60, wins: 1, losses: 4 },
    ],
  },
} satisfies TemplateEntry

export default WeeklyRecapEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = {
  padding: '32px 28px',
  backgroundColor: '#121c2e',
  borderRadius: '14px',
  maxWidth: '540px',
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
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 14px' }
const text = { fontSize: '14px', color: '#c3cbdb', lineHeight: '1.6', margin: '0 0 14px' }
const muted = { fontSize: '13px', color: '#8794ad', margin: '0 0 16px' }
const statBox = {
  backgroundColor: '#0f1829',
  border: '1px solid #223154',
  borderRadius: '10px',
  padding: '16px 8px',
  margin: '0 0 18px',
}
const statCol = { textAlign: 'center' as const }
const statValue = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  margin: '0 0 4px',
}
const statLabel = { fontSize: '11px', color: '#8794ad', margin: '0' }
const good = { color: '#3ddc97', fontWeight: 'bold' as const }
const bad = { color: '#ff6b6b', fontWeight: 'bold' as const }
const hr = { borderColor: '#223154', margin: '20px 0' }
const sectionTitle = {
  fontSize: '12px',
  letterSpacing: '1px',
  color: '#8794ad',
  margin: '0 0 10px',
  fontWeight: 'bold' as const,
}
const standRow = { padding: '4px 0' }
const standRowYou = {
  padding: '4px 6px',
  backgroundColor: '#1a2740',
  borderRadius: '6px',
}
const rankCol = { width: '28px' }
const ptsCol = { textAlign: 'right' as const }
const standText = { fontSize: '13px', color: '#c3cbdb', margin: '0' }
const standTextYou = {
  fontSize: '13px',
  color: '#f59043',
  margin: '0',
  fontWeight: 'bold' as const,
}
const button = {
  backgroundColor: '#f2751f',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
  marginTop: '20px',
}
const footer = { fontSize: '12px', color: '#8794ad', margin: '28px 0 0' }
