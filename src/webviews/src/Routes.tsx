import React, { useEffect } from 'react'
import {
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom'

import {
  KeysTreePage,
  CliPage,
  DatabasePage,
  AddKeyPage,
  KeyDetailsPage,
  NotFoundPage,
} from 'uiSrc/pages'

const rootEl = document.getElementById('root')

export const AppRoutes = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/${rootEl?.dataset.route}`, { replace: true })
  }, [])

  return (
    <Routes>
      <Route path="tree" element={<KeysTreePage />} />
      <Route path="cli" element={<CliPage />} />
      <Route path="main" element={<DatabasePage />}>
        <Route path="key" element={<KeyDetailsPage />} />
        <Route path="add_key" element={<AddKeyPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
