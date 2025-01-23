import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  Box,
  Button,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  useToast,
  Heading,
  VStack,
  HStack,
} from '@chakra-ui/react';

export default function PhoneMapping() {
  const [laundries, setLaundries] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [selectedLaundry, setSelectedLaundry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Charger les laveries
    const { data: laundriesData } = await supabase
      .from('laundries')
      .select('id, name, address');
    setLaundries(laundriesData || []);

    // Charger les mappings existants
    const { data: mappingsData } = await supabase
      .from('phone_mappings')
      .select(`
        id,
        phone_number,
        laundry:laundries (
          id,
          name,
          address
        ),
        is_active
      `);
    setMappings(mappingsData || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || !selectedLaundry) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        status: 'error',
      });
      return;
    }

    // Insérer le mapping
    const { error } = await supabase
      .from('phone_mappings')
      .insert({
        phone_number: phoneNumber,
        laundry_id: selectedLaundry,
        is_active: true
      });

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
      });
      return;
    }

    toast({
      title: 'Succès',
      description: 'Association créée avec succès',
      status: 'success',
    });

    // Recharger les données
    loadData();
    setPhoneNumber('');
    setSelectedLaundry('');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Gestion des Numéros de Téléphone</Heading>

        {/* Formulaire d'ajout */}
        <Box p={4} borderWidth={1} borderRadius="lg">
          <form onSubmit={handleSubmit}>
            <HStack spacing={4}>
              <Select
                placeholder="Sélectionner une laverie"
                value={selectedLaundry}
                onChange={(e) => setSelectedLaundry(e.target.value)}
              >
                {laundries.map((laundry) => (
                  <option key={laundry.id} value={laundry.id}>
                    {laundry.name} - {laundry.address}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Numéro de téléphone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Button type="submit" colorScheme="blue">
                Ajouter
              </Button>
            </HStack>
          </form>
        </Box>

        {/* Liste des associations */}
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Laverie</Th>
              <Th>Adresse</Th>
              <Th>Numéro</Th>
              <Th>Statut</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mappings.map((mapping) => (
              <Tr key={mapping.id}>
                <Td>{mapping.laundry.name}</Td>
                <Td>{mapping.laundry.address}</Td>
                <Td>{mapping.phone_number}</Td>
                <Td>{mapping.is_active ? 'Actif' : 'Inactif'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Container>
  );
}

// Protection de la page admin
export async function getServerSideProps({ req }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  
  if (!user || user.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
}
