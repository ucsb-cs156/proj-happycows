import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="bg-light pt-3 pt-md-4 pb-4 pb-md-5">
      <Container>
        <p data-testid="footer-content">
          HappyCows is a project of <a href="https://devries.chem.ucsb.edu/about-5">Mattanjah de Vries</a>, 
          Distinguished Professor of Chemistry at UC Santa Barbara.
        </p>
        
      </Container>
    </footer>
  );
}
