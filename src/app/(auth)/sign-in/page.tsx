import { LoginButton } from './login-button'

export default function SigIn() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h2 className="text-2xl ">Login</h2>
      <div className="mt-4">
        <LoginButton />
      </div>
    </div>
  )
}
