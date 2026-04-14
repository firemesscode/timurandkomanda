import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Article } from './pages/Article';
import { Articles } from './pages/Articles';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { AuthorStudio } from './pages/AuthorStudio';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="article/:id" element={<Article />} />
            <Route path="articles" element={<Articles />} />
            <Route path="login" element={<Login />} />
            <Route path="admin" element={<Admin />} />
          </Route>
          <Route path="/admin/studio/:id" element={<AuthorStudio />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
