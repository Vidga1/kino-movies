interface CloseIconProps {
  width?: number
  height?: number
  className?: string
}

export function CloseIcon({ width = 20, height = 20, className }: CloseIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M15 5L5 15M5 5L15 15'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
