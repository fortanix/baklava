
import {
  Icon,
  Button,
  Link,
  DialogModal,
  Panel,
  AppLayout,
  Logo,
  Header,
  UserMenu,
  AccountSelector,
  SolutionSelector,
  Nav,
  Sidebar,
  Breadcrumbs,
} from '@fortanix/baklava';

export const App = () => {
  return (
    <AppLayout>
      <header slot="header" className="bk-theme--dark">
        <Link unstyled href="#" slot="logo">
          <Logo subtitle="Data Security Manager" subtitleTrademark={true}/>
        </Link>
        <Header slot="actions">
          <UserMenu userName="Anand Kashyap"/>
          {/* <UserMenu userName="Anand Kashyap – Very Long Name That Will Overflow"/> */}
          <AccountSelector className="select-action"/>
          <SolutionSelector className="select-action"/>
        </Header>
      </header>
      {/* Container around the sidebar that grows to full height, allowing the sidebar to be sticky */}
      <div slot="sidebar" className="bk-theme--dark">
        <Sidebar className="bk-app-layout__sidebar">
          <Nav>
            <Nav.NavItem active icon="dashboard" label="Dashboard" href="#"/>
            <Nav.NavItem icon="dashboard" label="Groups" href="#"/>
          </Nav>
        </Sidebar>
      </div>
      <main slot="content">
        <Icon icon="accounts"/>
        
        <Breadcrumbs
          items={[
            {
              title: 'Fortanix Armor',
              href: '#',
            },
            {
              title: 'Dashboard',
              href: '#',
            }
          ]}
        />
        <Panel>
          <Panel.Heading>Panel</Panel.Heading>
          
          <DialogModal
            title="Modal"
            trigger={({ activate }) => <Button label="Open modal" onPress={activate}/>}
          >
            Test
          </DialogModal>
        </Panel>
      </main>
      <footer slot="footer">
        <span className="version">Version: 4.24.2343</span>
      </footer>
    </AppLayout>
  );
};

export default App;
