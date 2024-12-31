import { Accordion, Title, Container, Text, Paper, List, ThemeIcon, rem } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';

export function HelpCenter() {
  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl" ta="center">
        Support et Aide
      </Title>

      <Accordion variant="separated">
        {/* Guide Rapide */}
        <Accordion.Item value="quick-start">
          <Accordion.Control>Guide Rapide</Accordion.Control>
          <Accordion.Panel>
            <Paper p="md">
              <Text size="sm" mb="md">
                Bienvenue sur WeWash Dashboard ! Voici les étapes essentielles pour commencer :
              </Text>
              <List
                spacing="xs"
                size="sm"
                center
                icon={
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
                  </ThemeIcon>
                }
              >
                <List.Item>Accédez au tableau de bord pour une vue d'ensemble</List.Item>
                <List.Item>Consultez l'état de vos machines en temps réel</List.Item>
                <List.Item>Gérez vos interventions depuis l'onglet maintenance</List.Item>
                <List.Item>Analysez vos performances via les rapports</List.Item>
              </List>
            </Paper>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Gestion des Laveries */}
        <Accordion.Item value="laundry-management">
          <Accordion.Control>Gestion des Laveries</Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" mb="md">
              Gérez efficacement vos laveries avec ces fonctionnalités :
            </Text>
            <List type="ordered" spacing="xs" size="sm">
              <List.Item>Vue d'ensemble des machines</List.Item>
              <List.Item>Suivi des revenus en temps réel</List.Item>
              <List.Item>Configuration des tarifs</List.Item>
              <List.Item>Gestion des plannings</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Interventions */}
        <Accordion.Item value="interventions">
          <Accordion.Control>Gestion des Interventions</Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" mb="md">
              Suivez et gérez les interventions techniques :
            </Text>
            <List type="ordered" spacing="xs" size="sm">
              <List.Item>Création de tickets d'intervention</List.Item>
              <List.Item>Suivi en temps réel</List.Item>
              <List.Item>Attribution aux techniciens</List.Item>
              <List.Item>Historique des maintenances</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Rapports */}
        <Accordion.Item value="reports">
          <Accordion.Control>Rapports et Analytics</Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" mb="md">
              Analysez les performances de vos laveries :
            </Text>
            <List type="ordered" spacing="xs" size="sm">
              <List.Item>Rapports de revenus</List.Item>
              <List.Item>Statistiques d'utilisation</List.Item>
              <List.Item>Analyse des interventions</List.Item>
              <List.Item>Export des données</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        {/* FAQ */}
        <Accordion.Item value="faq">
          <Accordion.Control>Questions Fréquentes</Accordion.Control>
          <Accordion.Panel>
            <Accordion variant="contained">
              <Accordion.Item value="faq-1">
                <Accordion.Control>Comment créer une intervention ?</Accordion.Control>
                <Accordion.Panel>
                  Accédez à l'onglet "Interventions", cliquez sur "Nouvelle Intervention", 
                  remplissez les détails nécessaires et assignez un technicien.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="faq-2">
                <Accordion.Control>Comment suivre mes revenus ?</Accordion.Control>
                <Accordion.Panel>
                  Le tableau de bord principal affiche un résumé des revenus. 
                  Pour plus de détails, consultez la section "Rapports".
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="faq-3">
                <Accordion.Control>Comment configurer les alertes ?</Accordion.Control>
                <Accordion.Panel>
                  Dans les paramètres de votre profil, vous pouvez personnaliser 
                  les types d'alertes et leur mode de notification.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Accordion.Panel>
        </Accordion.Item>

        {/* Contact Support */}
        <Accordion.Item value="contact">
          <Accordion.Control>Contact Support</Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" mb="md">
              Notre équipe support est disponible pour vous aider :
            </Text>
            <List spacing="xs" size="sm">
              <List.Item>Email : support@wewash.fr</List.Item>
              <List.Item>Téléphone : +33 1 23 45 67 89</List.Item>
              <List.Item>Horaires : Lun-Ven, 9h-18h</List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
