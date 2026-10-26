import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import AnimeScreen from './screens/AnimeScreen';
import './App.css';

function App() {
  return (
    <>
      <Header />
      <main className='py-3'>
        <Container>
          <Routes>
            <Route path='/' element={<HomeScreen />} />
            <Route path='/anime/:id' element={<AnimeScreen />} />
          </Routes>
        </Container>
      </main>
    </>
  );
}

export default App;
