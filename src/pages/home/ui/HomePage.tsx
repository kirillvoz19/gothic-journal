import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { BelarusianText } from '../../../components/BelarusianText'
import { Groups } from '../../../components/Groups'
import { Teachers } from '../../../components/Teachers'
import { useAppOutletContext } from '../../../app/providers/router/useAppOutletContext'
import { accordionSummaryAccentSx, paperCardSx } from '../../../app/theme'

const TAB_PARAM = 'tab'
const TAB_GROUPS = 'groups'
const TAB_TEACHERS = 'teachers'
const VALID_TABS = new Set([TAB_GROUPS, TAB_TEACHERS])
type TabId = typeof TAB_GROUPS | typeof TAB_TEACHERS

function parseTabsFromUrl(value: string | null): TabId[] {
  if (!value) return []
  return value.split(',').filter((t): t is TabId => VALID_TABS.has(t as TabId))
}

export const HomePage = () => {
  const { authenticatedFetch, isAdmin, isTeacher } = useAppOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const expandedTabs = useMemo(
    () => new Set(parseTabsFromUrl(searchParams.get(TAB_PARAM))),
    [searchParams]
  )

  const setTabs = (tabs: TabId[]) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (tabs.length > 0) next.set(TAB_PARAM, tabs.join(','))
        else next.delete(TAB_PARAM)
        return next
      },
      { replace: true }
    )
  }

  const toggleTab = (tab: TabId, isExpanded: boolean) => {
    const next = parseTabsFromUrl(searchParams.get(TAB_PARAM))
    if (isExpanded) {
      if (!next.includes(tab)) next.push(tab)
    } else {
      const idx = next.indexOf(tab)
      if (idx !== -1) next.splice(idx, 1)
    }
    setTabs(next)
  }

  // Преподаватель: только содержимое групп в контейнере с белым фоном, тенью и закруглением
  if (isTeacher) {
    return (
      <Paper elevation={0} sx={{ ...paperCardSx, overflow: 'hidden' }}>
        <Groups authenticatedFetch={authenticatedFetch} />
      </Paper>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Accordion
        expanded={expandedTabs.has(TAB_GROUPS)}
        onChange={(_, isExpanded) => toggleTab(TAB_GROUPS, isExpanded)}
        sx={{
          ...paperCardSx,
          '&:before': { display: 'none' },
          overflow: 'hidden',
          '&.Mui-expanded': { margin: 0 },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryAccentSx}>
          <Typography variant="subtitle1" fontWeight={600} color="primary.light">
            <BelarusianText belarusian="Групы" russian="Группы" />
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: 'background.paper' }}>
          <Groups authenticatedFetch={authenticatedFetch} />
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedTabs.has(TAB_TEACHERS)}
        onChange={(_, isExpanded) => toggleTab(TAB_TEACHERS, isExpanded)}
        sx={{
          ...paperCardSx,
          '&:before': { display: 'none' },
          overflow: 'hidden',
          '&.Mui-expanded': { margin: 0 },
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionSummaryAccentSx}>
          <Typography variant="subtitle1" fontWeight={600} color="primary.light">
            <BelarusianText
              belarusian="Выкладчыкі"
              russian="Преподаватели"
            />
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: 'background.paper' }}>
          <Teachers authenticatedFetch={authenticatedFetch} isAdmin={isAdmin} />
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

