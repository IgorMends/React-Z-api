import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ConnectPage from './pages/ConnectPage.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import InstancePage from './pages/InstancePage.jsx'
import MessagePage from './pages/MessagePage.jsx'
import ChatPage from './pages/ChatPage.jsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      /*COLOCAR PAGINAS
      {
        PATH: "/CLIENTES",
        ELEMENT: <ClientPage/>
      }
      */
      {
        path: "/Connect",
        element: <ConnectPage />
      },
      {
        path: "/Instance",
        element: <InstancePage />
      },
      {
        path: "/Message",
        element: <MessagePage />
      },
      {
        path: "/Chat",
        element: <ChatPage />
      }
    ]
  },
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)