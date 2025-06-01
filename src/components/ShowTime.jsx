import { ButtonGroup, Button } from 'react-bootstrap';

const ShowTime = () => (
  <div className="mt-4">
    <h4>Available Showtimes:</h4>
    <ButtonGroup className="mt-2">
      <Button variant="primary">10:00</Button>
      <Button variant="primary">13:00</Button>
    </ButtonGroup>
  </div>
);

export default ShowTime;
