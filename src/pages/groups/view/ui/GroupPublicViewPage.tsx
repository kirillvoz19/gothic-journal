import { Alert, Box } from '@mui/material'
import { useParams } from 'react-router-dom'
import { BelarusianText } from '../../../../components/BelarusianText'
import { GroupForm } from '../../../../features/groups/ui/group-form/GroupForm'

const parseGroupId = (value: string | undefined): number | null => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export const GroupPublicViewPage = () => {
  const params = useParams<{ groupId: string }>()
  const groupId = parseGroupId(params.groupId)

  if (!groupId) {
    return (
      <Alert severity="error">
        <BelarusianText
          belarusian="Няправільны ідэнтыфікатар групы"
          russian="Некорректный идентификатор группы"
        />
      </Alert>
    )
  }

  return (
    <Box>
      <GroupForm
        title={<BelarusianText belarusian="Прагляд групы" russian="Просмотр группы" />}
        mode="edit"
        groupId={groupId}
        readOnly
        onDone={() => {}}
        onCancel={() => {}}
      />
    </Box>
  )
}
