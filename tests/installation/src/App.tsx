
import {
  Icon,
  Button,
  Link,
  DialogModal,
  Panel,
  FortanixLogo,
  Header,
  UserMenu,
  AccountSelector,
  SolutionSelector,
  Nav,
  Sidebar,
  Breadcrumbs,
  AppLayout,
} from '@fortanix/baklava';

export const App = () => {
  return (
    <AppLayout>
      <AppLayout.Header>
        <Link unstyled href="#" slot="logo">
          <FortanixLogo subtitle="Data Security Manager" subtitleTrademark={true}/>
        </Link>
        <Header slot="actions">
          <UserMenu userName="Anand Kashyap"/>
          {/* <UserMenu userName="Anand Kashyap – Very Long Name That Will Overflow"/> */}
          <AccountSelector className="select-action" accounts={null}>
            {selectedAccount => selectedAccount === null ? 'Accounts' : selectedAccount.label}
          </AccountSelector>
          <SolutionSelector className="select-action" solutions={null}/>
        </Header>
      </AppLayout.Header>
      {/* Container around the sidebar that grows to full height, allowing the sidebar to be sticky */}
      <AppLayout.Sidebar>
        <Sidebar className="bk-app-layout__sidebar">
          <Nav>
            <Nav.NavItem active icon="dashboard" label="Dashboard" href="#"/>
            <Nav.NavItem icon="dashboard" label="Groups" href="#"/>
          </Nav>
        </Sidebar>
      </AppLayout.Sidebar>
      <AppLayout.Content>
        <Icon icon="accounts"/>
        
        <Breadcrumbs>
          <Breadcrumbs.Item href="/" label="Fortanix Armor"/>
          <Breadcrumbs.Item href="/" label="Dashboard" active/>
        </Breadcrumbs>
        <Panel>
          <Panel.Heading>Panel</Panel.Heading>
          
          <DialogModal
            title="Modal"
            trigger={({ activate }) => <Button label="Open modal" onPress={activate}/>}
          >
            Test
          </DialogModal>
        </Panel>
      </AppLayout.Content>
      <AppLayout.Footer>
        <span className="version">Version: 1.2.2343</span>
      </AppLayout.Footer>
    </AppLayout>
  );
};

export default App;
