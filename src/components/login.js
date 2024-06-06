import { useState, memo } from 'react';


const Login = ({ setIsLogin }) => {
    const [loginForm, setLoginForm] = useState({ username: '', password: '' })
    const [registerForm, setRegisterForm] = useState({ username: '', password: '' })

    function handleLogin(e) {
        e.preventDefault()
        fetch(`${process.env.REACT_APP_HOST}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${loginForm.username}&password=${loginForm.password}`
        })
            .then(res => res.json())
            .then(res => {
                if (res.access_token) {
                    alert('登录成功')
                    localStorage.setItem('token', res.access_token)
                    localStorage.setItem('token_expire_at', res.expires_at)
                    localStorage.setItem('user_id', res.user_id)
                    setIsLogin(true)
                    setLoginForm({ username: '', password: '' })
                } else {
                    alert('登录失败')
                }
            })
            .catch(e => { console.log(e); alert('登录失败') })
    }

    function handleRegister(e) {
        e.preventDefault()
        fetch(`${process.env.REACT_APP_HOST}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: registerForm.username,
                password: registerForm.password
            })
        })
            .then(res => res.json())
            .then(res => {
                if (res.username) {
                    alert(`注册成功，用户名：${res.username}`)
                    setRegisterForm({ username: '', password: '' })
                } else {
                    alert('注册失败')
                }
            })
            .catch(e => { console.log(e); alert('注册失败') })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">登录</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2 text-start" htmlFor="username">
                            用户名
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={loginForm.username}
                            onChange={(e) => setLoginForm(prev => { return { ...prev, username: e.target.value } })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2 text-start" htmlFor="password">
                            密码
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm(prev => { return { ...prev, password: e.target.value } })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            登录
                        </button>
                    </div>
                </form>
                <h2 className="text-2xl font-bold my-6 text-center">注册</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2 text-start" htmlFor="username">
                            用户名
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm(prev => { return { ...prev, username: e.target.value } })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2 text-start" htmlFor="password">
                            密码
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm(prev => { return { ...prev, password: e.target.value } })}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            注册
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default memo(Login)