import React from 'react'

type PropsWithChildren<P = unknown> = P & {
    children?: React.ReactNode;
}
const Card:React.FC<PropsWithChildren> = ({children}) => {
  return (
    <div className='p-3 md:p-4 bg-white shadow-md rounded-md mx-4 my-4'>
      {children}
    </div>
  )
}

export default Card
