import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout/AuthLayout';
import { PublicLayout } from '@/layouts/PublicLayout/PublicLayout';
import { AUTH_ROUTES, DEFAULT_ROUTES, PUBLIC_ROUTES } from '@/config/routes.config';
import { Login } from '@/pages/Login/Login';
import { Register } from '@/pages/Register/Register';
import { Games } from '@/pages/Games/Games';
import { NewGame } from '@/pages/NewGame/NewGame';
import { Game } from '@/pages/Game/Game';
import { JoinGame } from '@/pages/JoinGame/JoinGame';
import { NotFound } from '@/pages/NotFound/NotFound';

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to={AUTH_ROUTES.GAMES} replace />} />

      <Route element={<PublicLayout />}>
        <Route path={PUBLIC_ROUTES.LOGIN} element={<Login />} />
        <Route path={PUBLIC_ROUTES.REGISTER} element={<Register />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path={AUTH_ROUTES.GAMES} element={<Games />} />
        <Route path={AUTH_ROUTES.NEW_GAME} element={<NewGame />} />
        <Route path={AUTH_ROUTES.GAME} element={<Game />} />
        <Route path={AUTH_ROUTES.JOIN} element={<JoinGame />} />
      </Route>

      <Route path={DEFAULT_ROUTES.NOT_FOUND} element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
