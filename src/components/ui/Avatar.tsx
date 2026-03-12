import { getInitials, generateAvatarColor } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  online?: boolean
  className?: string
}

const SIZES = {
  xs:  { outer: 'w-7 h-7',  text: 'text-xs',  indicator: 'w-2 h-2' },
  sm:  { outer: 'w-9 h-9',  text: 'text-sm',  indicator: 'w-2.5 h-2.5' },
  md:  { outer: 'w-11 h-11', text: 'text-base', indicator: 'w-3 h-3' },
  lg:  { outer: 'w-14 h-14', text: 'text-xl', indicator: 'w-3.5 h-3.5' },
  xl:  { outer: 'w-20 h-20', text: 'text-3xl', indicator: 'w-4 h-4' },
}

export default function Avatar({ name, size = 'md', src, online, className = '' }: AvatarProps) {
  const { outer, text, indicator } = SIZES[size]
  const color = generateAvatarColor(name)
  const initials = getInitials(name)

  return (
    <div className={`relative flex-shrink-0 ${outer} ${className}`}>
      <div
        className={`w-full h-full rounded-full flex items-center justify-center font-display font-medium select-none overflow-hidden`}
        style={{ backgroundColor: color + '33', border: `2px solid ${color}44` }}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={`${text} font-display`} style={{ color }}>
            {initials}
          </span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${indicator} rounded-full border-2 ${
            online ? 'bg-emerald-400' : 'bg-gray-500'
          }`}
          style={{ borderColor: 'var(--bg-primary)' }}
        />
      )}
    </div>
  )
}
