export function ConsultationChoiceField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const custom = value && !options.includes(value)

  return (
    <label className="consultation-form-field">
      {label}
      <select value={custom ? '__custom__' : value} onChange={(event) => onChange(event.target.value === '__custom__' ? '직접 입력' : event.target.value)}>
        <option value="">선택해 주세요</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
        <option value="__custom__">직접 입력</option>
      </select>
      {(custom || value === '직접 입력') && <input value={custom ? value : ''} onChange={(event) => onChange(event.target.value)} placeholder="내용을 직접 입력해 주세요" />}
    </label>
  )
}
