import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text);
`;

const ExerciseCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const ExerciseTitle = styled.h3`
  color: var(--primary);
  margin-bottom: 1rem;
`;

const CodeBlock = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
`;

const Button = styled.button`
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.3s ease;
  
  &:hover {
    background: #357abd;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0.5rem 0;
`;

const Result = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
  border-radius: 4px;
  color: ${props => props.success ? '#155724' : '#721c24'};
`;

export default function TestExerciseInterface() {
  const [userCode, setUserCode] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testCode = () => {
    setIsLoading(true);
    // Simulate code execution
    setTimeout(() => {
      const success = userCode.includes('console.log') && userCode.includes('Hello');
      setResult({
        success,
        message: success 
          ? 'Code exécuté avec succès!' 
          : 'Le code ne contient pas les éléments requis.'
      });
      setIsLoading(false);
    }, 1000);
  };

  const resetExercise = () => {
    setUserCode('');
    setResult(null);
  };

  return (
    <Container>
      <Title>Interface de Test d'Exercice</Title>
      
      <ExerciseCard>
        <ExerciseTitle>Exercice 1: Premier Programme</ExerciseTitle>
        <p>Écrivez un programme qui affiche "Hello World" dans la console.</p>
        
        <CodeBlock>
{`// Votre code ici
console.log("Hello World");`}
        </CodeBlock>
        
        <Input
          type="text"
          placeholder="Tapez votre code ici..."
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
        />
        
        <div>
          <Button onClick={testCode} disabled={isLoading}>
            {isLoading ? 'Exécution...' : 'Tester le Code'}
          </Button>
          <Button onClick={resetExercise} style={{background: '#6c757d'}}>
            Réinitialiser
          </Button>
        </div>
        
        {result && (
          <Result success={result.success}>
            {result.message}
          </Result>
        )}
      </ExerciseCard>
      
      <ExerciseCard>
        <ExerciseTitle>Exercice 2: Variables</ExerciseTitle>
        <p>Créez une variable qui stocke votre nom et affichez-la.</p>
        
        <CodeBlock>
{`// Exemple de solution
const nom = "Votre Nom";
console.log("Mon nom est:", nom);`}
        </CodeBlock>
      </ExerciseCard>
      
      <ExerciseCard>
        <ExerciseTitle>Exercice 3: Boucles</ExerciseTitle>
        <p>Écrivez une boucle qui affiche les nombres de 1 à 5.</p>
        
        <CodeBlock>
{`// Solution
for (let i = 1; i <= 5; i++) {
  console.log(i);
}`}
        </CodeBlock>
      </ExerciseCard>
    </Container>
  );
}
