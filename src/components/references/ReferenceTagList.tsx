interface ReferenceTagListProps {
  tags: string[]
  max?: number
  matchedTags?: string[]
  variant: 'client' | 'planner'
}

export function ReferenceTagList({ tags, max, matchedTags = [], variant }: ReferenceTagListProps) {
  const visibleTags = typeof max === 'number' ? tags.slice(0, max) : tags

  return <div className={variant === 'client' ? 'reference-tag-list reference-tag-list--client' : 'reference-card-keywords'}>
    {visibleTags.map((tag) => <span className={matchedTags.includes(tag) ? 'matched' : ''} key={tag}>#{tag}</span>)}
  </div>
}
