import { useEffect } from 'react'
import { Select, Tooltip } from 'antd'
import useBranchStore from '../../store/branch'

const BranchSelector = ({ mobile }: { mobile: boolean }) => {
  const { branches, branchId, ready, error, load, select } = useBranchStore()
  useEffect(() => { void load() }, [load])
  return (
    <Tooltip title="Current branch">
      <Select
        aria-label="Current branch"
        placeholder="Branch"
        loading={!ready && !error}
        disabled={!ready}
        value={branchId}
        style={{ width: mobile ? 115 : 190 }}
        options={branches.map(branch => ({ value: branch.id, label: branch.name }))}
        onChange={select}
      />
    </Tooltip>
  )
}

export default BranchSelector
