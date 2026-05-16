# App-Specific Design Specifications

**Detailed UI/UX specifications for each Lumeos application**

---

## 🌐 1. Web App (Marketing/Landing) — Port 8500

### Target Audience
- Prospective users discovering Lumeos
- Health professionals evaluating the platform
- Media and investors researching the company

### Design Strategy
**"Professional Health Tech with Human Touch"**

#### Visual Identity
```css
/* Brand Gradient */
--hero-gradient: linear-gradient(135deg, #2563eb 0%, #0d9488 50%, #16a34a 100%);
--cta-gradient: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);

/* Typography */
--hero-font: 'Inter', sans-serif;
--body-font: 'Inter', sans-serif;
--accent-font: 'JetBrains Mono', monospace; /* For data/metrics */
```

#### Page Structure & Components

##### Header Navigation
```jsx
<Header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg">
  <Container>
    <Logo>LUMEOS</Logo>
    <Navigation>
      <NavLink to="/features">Features</NavLink>
      <NavLink to="/pricing">Pricing</NavLink>
      <NavLink to="/professionals">For Professionals</NavLink>
      <NavLink to="/about">About</NavLink>
    </Navigation>
    <CTAGroup>
      <Button variant="ghost" href="/login">Login</Button>
      <Button variant="primary" href="/signup">Start Free Trial</Button>
    </CTAGroup>
  </Container>
</Header>
```

##### Hero Section
```jsx
<HeroSection className="pt-20 pb-16 bg-gradient-to-br from-blue-600 via-teal-600 to-green-600">
  <Container>
    <HeroContent className="text-center text-white">
      <Badge className="mb-6 bg-white/20 text-white">
        ✨ AI-Powered Health Optimization
      </Badge>
      <H1 className="mb-6 text-5xl font-extrabold leading-tight">
        Your Complete Health
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
          Performance OS
        </span>
      </H1>
      <Subtitle className="mb-8 text-xl text-blue-100 max-w-2xl mx-auto">
        Track nutrition, training, recovery, and medical data in one platform. 
        Get AI-powered insights that actually improve your health.
      </Subtitle>
      <CTAGroup className="gap-4">
        <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
          Start Your Free Trial
          <ArrowRightIcon className="ml-2" />
        </Button>
        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
          Watch Demo
          <PlayIcon className="ml-2" />
        </Button>
      </CTAGroup>
      <TrustIndicators className="mt-8 flex justify-center gap-8 text-blue-200">
        <Stat>
          <StatNumber>10,000+</StatNumber>
          <StatLabel>Active Users</StatLabel>
        </Stat>
        <Stat>
          <StatNumber>50M+</StatNumber>
          <StatLabel>Data Points Tracked</StatLabel>
        </Stat>
        <Stat>
          <StatNumber>95%</StatNumber>
          <StatLabel>Goal Achievement Rate</StatLabel>
        </Stat>
      </TrustIndicators>
    </HeroContent>
  </Container>
</HeroSection>
```

##### Features Section
```jsx
<FeaturesSection className="py-20 bg-gray-50">
  <Container>
    <SectionHeader className="text-center mb-16">
      <H2>Everything Your Health Needs</H2>
      <Subtitle>10 integrated modules, one complete platform</Subtitle>
    </SectionHeader>
    
    <ModuleGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {modules.map(module => (
        <ModuleCard key={module.id} className={`border-l-4 border-${module.color}-500`}>
          <ModuleIcon color={module.color} size="large" />
          <ModuleTitle>{module.name}</ModuleTitle>
          <ModuleDescription>{module.description}</ModuleDescription>
          <ModuleFeatures>
            {module.keyFeatures.map(feature => (
              <FeatureItem key={feature}>
                <CheckIcon className="text-green-500" />
                {feature}
              </FeatureItem>
            ))}
          </ModuleFeatures>
        </ModuleCard>
      ))}
    </ModuleGrid>
  </Container>
</FeaturesSection>
```

#### Mobile Responsiveness
```css
/* Mobile Navigation */
@media (max-width: 768px) {
  .header-nav {
    position: fixed;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  }
  
  .header-nav.open {
    transform: translateY(0);
  }
}
```

---

## 📱 2. Main App (User Interface) — Port 8501

### Target Audience
- Daily active users tracking health metrics
- Fitness enthusiasts optimizing performance
- Health-conscious individuals managing wellness

### Design Strategy
**"Clean Data Density with Intuitive Navigation"**

#### App Architecture
```jsx
<AppContainer>
  <ModuleHeader dynamic />
  <MainContent>
    <ModuleTabNavigation />
    <ScrollableContent>
      {/* Dynamic module content */}
    </ScrollableContent>
  </MainContent>
  <BottomNavigation fixed />
</AppContainer>
```

#### Module Header Design
```jsx
<ModuleHeader className={`bg-gradient-to-r from-${moduleColor}-500 to-${moduleColor}-600`}>
  <HeaderContent className="flex items-center justify-between p-4 text-white">
    <ModuleInfo>
      <ModuleIcon size="md" className="text-white/90" />
      <ModuleTitle className="text-lg font-semibold">{moduleName}</ModuleTitle>
    </ModuleInfo>
    
    <ModuleStatus>
      <HealthScore value={score} variant="light" />
      <StatusBadge status={status} />
    </ModuleStatus>
    
    <HeaderActions>
      <IconButton>
        <BellIcon />
        {hasNotifications && <NotificationDot />}
      </IconButton>
      <IconButton>
        <SettingsIcon />
      </IconButton>
    </HeaderActions>
  </HeaderContent>
</ModuleHeader>
```

#### Module Tab Navigation
```jsx
<ModuleTabNavigation className="bg-white border-b border-gray-200">
  <TabList className="flex overflow-x-auto">
    {moduleTabs.map(tab => (
      <Tab 
        key={tab.id}
        isActive={activeTab === tab.id}
        className={`
          px-6 py-3 font-medium text-sm whitespace-nowrap
          ${isActive 
            ? `text-${moduleColor}-600 border-b-2 border-${moduleColor}-600` 
            : 'text-gray-500 hover:text-gray-700'
          }
        `}
      >
        {tab.icon && <TabIcon icon={tab.icon} />}
        {tab.label}
        {tab.count && <TabBadge count={tab.count} />}
      </Tab>
    ))}
  </TabList>
</ModuleTabNavigation>
```

#### Content Layout Patterns

##### Dashboard View (Overview)
```jsx
<DashboardView className="p-4 space-y-6">
  <QuickStats className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {quickStats.map(stat => (
      <StatCard key={stat.id}>
        <StatIcon icon={stat.icon} color={stat.color} />
        <StatValue>{stat.value}</StatValue>
        <StatLabel>{stat.label}</StatLabel>
        <StatTrend direction={stat.trend} />
      </StatCard>
    ))}
  </QuickStats>
  
  <MainChart>
    <ChartHeader>
      <ChartTitle>Progress Trends</ChartTitle>
      <ChartControls>
        <TimeframePicker />
        <MetricSelector />
      </ChartControls>
    </ChartHeader>
    <TrendChart data={chartData} />
  </MainChart>
  
  <ActionCards>
    <TodayCard />
    <RecommendationsCard />
    <AlertsCard />
  </ActionCards>
</DashboardView>
```

##### Data Entry View
```jsx
<DataEntryView className="p-4">
  <EntryForm>
    <FormHeader>
      <FormTitle>Log Today's Nutrition</FormTitle>
      <QuickActions>
        <ScanBarcodeButton />
        <PhotoUploadButton />
        <VoiceInputButton />
      </QuickActions>
    </FormHeader>
    
    <FormContent>
      <SearchInput placeholder="Search foods..." />
      <RecentItems />
      <FavoriteItems />
    </FormContent>
    
    <FormActions sticky>
      <Button variant="ghost">Save Draft</Button>
      <Button variant="primary">Complete Entry</Button>
    </FormActions>
  </EntryForm>
</DataEntryView>
```

#### Bottom Navigation
```jsx
<BottomNavigation className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
  <NavGrid className="grid grid-cols-5 h-16">
    {mainNavItems.map(item => (
      <NavItem 
        key={item.id}
        isActive={currentModule === item.id}
        className="flex flex-col items-center justify-center"
      >
        <NavIcon 
          icon={item.icon} 
          className={`
            w-6 h-6 mb-1
            ${isActive ? `text-${item.color}-600` : 'text-gray-400'}
          `}
        />
        <NavLabel 
          className={`
            text-xs font-medium
            ${isActive ? `text-${item.color}-600` : 'text-gray-500'}
          `}
        >
          {item.label}
        </NavLabel>
        {item.hasAlert && <AlertDot />}
      </NavItem>
    ))}
  </NavGrid>
</BottomNavigation>
```

---

## 👨‍💼 3. Coach App (Coach Dashboard) — Port 8502

### Target Audience
- Health coaches managing multiple clients
- Personal trainers tracking client progress
- Nutrition specialists monitoring compliance

### Design Strategy
**"Professional Dashboard with Client-First Focus"**

#### Layout Architecture
```jsx
<CoachAppContainer>
  <CoachSidebar />
  <MainDashboard>
    <DashboardHeader />
    <ClientWorkspace />
  </MainDashboard>
</CoachAppContainer>
```

#### Coach Sidebar
```jsx
<CoachSidebar className="w-64 bg-indigo-900 text-white">
  <CoachProfile>
    <Avatar src={coach.avatar} size="lg" />
    <CoachInfo>
      <CoachName>{coach.name}</CoachName>
      <CoachTitle>{coach.title}</CoachTitle>
    </CoachInfo>
  </CoachProfile>
  
  <ClientList className="flex-1 overflow-y-auto">
    <SectionHeader>
      <SectionTitle>Active Clients ({clients.length})</SectionTitle>
      <AddClientButton />
    </SectionHeader>
    
    {clients.map(client => (
      <ClientItem 
        key={client.id}
        isActive={selectedClient === client.id}
        className={`
          flex items-center p-3 hover:bg-indigo-800
          ${isActive ? 'bg-indigo-700 border-r-4 border-pink-400' : ''}
        `}
      >
        <ClientAvatar src={client.avatar} />
        <ClientInfo>
          <ClientName>{client.name}</ClientName>
          <ClientStatus status={client.overallStatus} />
        </ClientInfo>
        <ClientAlerts>
          {client.alerts.map(alert => (
            <AlertIcon key={alert.type} type={alert.type} />
          ))}
        </ClientAlerts>
      </ClientItem>
    ))}
  </ClientList>
  
  <CoachTools>
    <ToolButton>
      <MessageIcon /> Messages
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </ToolButton>
    <ToolButton>
      <CalendarIcon /> Schedule
    </ToolButton>
    <ToolButton>
      <AnalyticsIcon /> Analytics
    </ToolButton>
  </CoachTools>
</CoachSidebar>
```

#### Client Dashboard View
```jsx
<ClientDashboard className="flex-1">
  <ClientHeader className="bg-gradient-to-r from-pink-500 to-indigo-600 text-white p-6">
    <ClientOverview>
      <ClientAvatar src={client.avatar} size="xl" />
      <ClientDetails>
        <ClientName className="text-2xl font-bold">{client.name}</ClientName>
        <ClientGoals>{client.primaryGoal}</ClientGoals>
        <ClientProgress>
          <ProgressMetric>
            <MetricLabel>Goal Progress</MetricLabel>
            <MetricValue>{client.goalProgress}%</MetricValue>
          </ProgressMetric>
          <ProgressMetric>
            <MetricLabel>Compliance</MetricLabel>
            <MetricValue>{client.compliance}%</MetricValue>
          </ProgressMetric>
        </ClientProgress>
      </ClientDetails>
    </ClientOverview>
    
    <QuickActions>
      <ActionButton variant="outline">
        <MessageIcon /> Send Message
      </ActionButton>
      <ActionButton variant="outline">
        <PlanIcon /> Update Plan
      </ActionButton>
      <ActionButton variant="outline">
        <VideoIcon /> Schedule Call
      </ActionButton>
    </QuickActions>
  </ClientHeader>
  
  <ModuleOverview className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
    {modules.map(module => (
      <ModuleStatusCard 
        key={module.id}
        module={module}
        clientData={client.moduleData[module.id]}
      />
    ))}
  </ModuleOverview>
  
  <DetailedAnalysis className="p-6">
    <AnalysisNav>
      <NavTab isActive>Overview</NavTab>
      <NavTab>Nutrition</NavTab>
      <NavTab>Training</NavTab>
      <NavTab>Recovery</NavTab>
      <NavTab>Trends</NavTab>
    </AnalysisNav>
    
    <AnalysisContent>
      {/* Dynamic content based on selected tab */}
    </AnalysisContent>
  </DetailedAnalysis>
</ClientDashboard>
```

#### Client Status Indicators
```jsx
const ClientStatusCard = ({ module, clientData }) => (
  <StatusCard className={`border-l-4 border-${module.color}-500`}>
    <CardHeader>
      <ModuleIcon icon={module.icon} color={module.color} />
      <ModuleName>{module.name}</ModuleName>
      <StatusBadge status={clientData.status} />
    </CardHeader>
    
    <CardContent>
      <ScoreDisplay value={clientData.score} max={100} />
      <LastUpdate>Updated {clientData.lastUpdate}</LastUpdate>
      
      {clientData.alerts.length > 0 && (
        <AlertList>
          {clientData.alerts.map(alert => (
            <AlertItem key={alert.id} severity={alert.severity}>
              {alert.message}
            </AlertItem>
          ))}
        </AlertList>
      )}
    </CardContent>
    
    <CardActions>
      <ActionLink>View Details</ActionLink>
      <ActionLink>Send Guidance</ActionLink>
    </CardActions>
  </StatusCard>
);
```

---

## 🛒 4. Marketplace App (Shopping) — Port 8503

### Target Audience
- Users purchasing training programs and meal plans
- Coaches selling their digital content
- Health enthusiasts browsing supplements and tools

### Design Strategy
**"E-commerce Excellence with Health Focus"**

#### Marketplace Layout
```jsx
<MarketplaceContainer>
  <MarketplaceHeader />
  <CategoryNavigation />
  <MainContent>
    <FilterSidebar />
    <ProductGrid />
  </MainContent>
  <ShoppingCart />
</MarketplaceContainer>
```

#### Category Navigation
```jsx
<CategoryNav className="bg-emerald-50 border-b border-emerald-200">
  <Container>
    <CategoryList className="flex overflow-x-auto gap-6 py-4">
      {categories.map(category => (
        <CategoryItem 
          key={category.id}
          isActive={activeCategory === category.id}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
            ${isActive 
              ? 'bg-emerald-500 text-white' 
              : 'text-emerald-700 hover:bg-emerald-100'
            }
          `}
        >
          <CategoryIcon icon={category.icon} />
          <CategoryLabel>{category.name}</CategoryLabel>
          <ProductCount>({category.productCount})</ProductCount>
        </CategoryItem>
      ))}
    </CategoryList>
  </Container>
</CategoryNav>
```

#### Product Grid
```jsx
<ProductGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <ProductImage>
        <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded-t-lg" />
        <ProductBadges>
          {product.isBestseller && <Badge variant="success">Bestseller</Badge>}
          {product.isNew && <Badge variant="info">New</Badge>}
          {product.discount && <Badge variant="warning">-{product.discount}%</Badge>}
        </ProductBadges>
      </ProductImage>
      
      <ProductInfo className="p-4">
        <ProductMeta className="flex items-center gap-2 mb-2">
          <CreatorAvatar src={product.creator.avatar} size="sm" />
          <CreatorName className="text-sm text-gray-600">{product.creator.name}</CreatorName>
          {product.creator.isVerified && <VerifiedIcon />}
        </ProductMeta>
        
        <ProductTitle className="font-semibold text-lg mb-2 line-clamp-2">
          {product.title}
        </ProductTitle>
        
        <ProductDescription className="text-gray-600 text-sm mb-3 line-clamp-3">
          {product.description}
        </ProductDescription>
        
        <ProductRating className="flex items-center gap-2 mb-3">
          <StarRating value={product.rating} />
          <RatingCount className="text-sm text-gray-500">
            ({product.reviewCount})
          </RatingCount>
        </ProductRating>
        
        <ProductFooter className="flex items-center justify-between">
          <ProductPrice>
            {product.discountPrice ? (
              <PriceGroup>
                <DiscountPrice className="text-lg font-bold text-emerald-600">
                  ${product.discountPrice}
                </DiscountPrice>
                <OriginalPrice className="text-sm text-gray-400 line-through">
                  ${product.originalPrice}
                </OriginalPrice>
              </PriceGroup>
            ) : (
              <RegularPrice className="text-lg font-bold text-gray-900">
                ${product.price}
              </RegularPrice>
            )}
          </ProductPrice>
          
          <AddToCartButton 
            size="sm" 
            variant="primary"
            onClick={() => addToCart(product.id)}
          >
            Add to Cart
          </AddToCartButton>
        </ProductFooter>
      </ProductInfo>
    </ProductCard>
  ))}
</ProductGrid>
```

#### Shopping Cart Drawer
```jsx
<CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)}>
  <CartHeader className="p-4 border-b border-gray-200">
    <CartTitle>Shopping Cart ({cartItems.length})</CartTitle>
    <CloseButton onClick={() => setCartOpen(false)} />
  </CartHeader>
  
  <CartItems className="flex-1 overflow-y-auto p-4">
    {cartItems.map(item => (
      <CartItem key={item.id} className="flex gap-4 py-4 border-b border-gray-100">
        <ItemImage src={item.image} alt={item.title} className="w-16 h-16 rounded" />
        <ItemInfo className="flex-1">
          <ItemTitle className="font-medium">{item.title}</ItemTitle>
          <ItemCreator className="text-sm text-gray-600">{item.creator}</ItemCreator>
          <ItemPrice className="text-emerald-600 font-semibold">${item.price}</ItemPrice>
        </ItemInfo>
        <ItemActions>
          <QuantityControl value={item.quantity} onChange={updateQuantity} />
          <RemoveButton onClick={() => removeFromCart(item.id)} />
        </ItemActions>
      </CartItem>
    ))}
  </CartItems>
  
  <CartFooter className="p-4 border-t border-gray-200 bg-gray-50">
    <CartSummary>
      <SummaryLine>
        <Label>Subtotal</Label>
        <Value>${cartSubtotal}</Value>
      </SummaryLine>
      <SummaryLine>
        <Label>Tax</Label>
        <Value>${cartTax}</Value>
      </SummaryLine>
      <SummaryLine className="font-bold text-lg">
        <Label>Total</Label>
        <Value>${cartTotal}</Value>
      </SummaryLine>
    </CartSummary>
    
    <CheckoutButton 
      className="w-full mt-4"
      variant="primary"
      size="lg"
      onClick={handleCheckout}
    >
      Proceed to Checkout
    </CheckoutButton>
  </CartFooter>
</CartDrawer>
```

---

## ⚙️ 5. Admin App (System Management) — Port 8504

### Target Audience
- System administrators
- Content moderators
- Business analysts and executives

### Design Strategy
**"Data-Rich Professional Interface"**

#### Admin Layout
```jsx
<AdminContainer>
  <AdminSidebar />
  <MainContent>
    <AdminHeader />
    <AdminWorkspace />
  </MainContent>
</AdminContainer>
```

#### Admin Sidebar
```jsx
<AdminSidebar className="w-64 bg-slate-900 text-white">
  <AdminBrand>
    <Logo variant="white" />
    <BrandText>LUMEOS Admin</BrandText>
  </AdminBrand>
  
  <AdminNavigation>
    <NavSection>
      <SectionTitle>Overview</SectionTitle>
      <NavItem icon="dashboard" href="/admin/dashboard">Dashboard</NavItem>
      <NavItem icon="analytics" href="/admin/analytics">Analytics</NavItem>
      <NavItem icon="health" href="/admin/system-health">System Health</NavItem>
    </NavSection>
    
    <NavSection>
      <SectionTitle>Users</SectionTitle>
      <NavItem icon="users" href="/admin/users">User Management</NavItem>
      <NavItem icon="user-plus" href="/admin/coaches">Coaches</NavItem>
      <NavItem icon="shield" href="/admin/permissions">Permissions</NavItem>
    </NavSection>
    
    <NavSection>
      <SectionTitle>Content</SectionTitle>
      <NavItem icon="package" href="/admin/marketplace">Marketplace</NavItem>
      <NavItem icon="flag" href="/admin/moderation">Moderation Queue</NavItem>
      <NavItem icon="database" href="/admin/data">Data Management</NavItem>
    </NavSection>
    
    <NavSection>
      <SectionTitle>System</SectionTitle>
      <NavItem icon="settings" href="/admin/settings">Settings</NavItem>
      <NavItem icon="shield-check" href="/admin/security">Security</NavItem>
      <NavItem icon="activity" href="/admin/logs">Audit Logs</NavItem>
    </NavSection>
  </AdminNavigation>
</AdminSidebar>
```

#### Dashboard Overview
```jsx
<AdminDashboard className="p-6 space-y-6">
  <DashboardHeader>
    <PageTitle>System Overview</PageTitle>
    <HeaderActions>
      <RefreshButton onClick={refreshData} />
      <ExportButton onClick={exportReport} />
    </HeaderActions>
  </DashboardHeader>
  
  <KPIGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <KPICard>
      <KPIIcon className="w-8 h-8 text-blue-500" icon="users" />
      <KPILabel>Active Users</KPILabel>
      <KPIValue>12,847</KPIValue>
      <KPIChange positive>+5.2% vs last month</KPIChange>
    </KPICard>
    
    <KPICard>
      <KPIIcon className="w-8 h-8 text-green-500" icon="trending-up" />
      <KPILabel>Revenue</KPILabel>
      <KPIValue>$45,692</KPIValue>
      <KPIChange positive>+12.8% vs last month</KPIChange>
    </KPICard>
    
    <KPICard>
      <KPIIcon className="w-8 h-8 text-purple-500" icon="database" />
      <KPILabel>Data Points</KPILabel>
      <KPIValue>2.4M</KPIValue>
      <KPIChange>Today</KPIChange>
    </KPICard>
    
    <KPICard>
      <KPIIcon className="w-8 h-8 text-red-500" icon="alert-triangle" />
      <KPILabel>Open Issues</KPILabel>
      <KPIValue>3</KPIValue>
      <KPIChange negative>Requires attention</KPIChange>
    </KPICard>
  </KPIGrid>
  
  <DashboardCharts className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartCard>
      <ChartHeader>
        <ChartTitle>User Growth</ChartTitle>
        <ChartControls>
          <TimeframePicker />
        </ChartControls>
      </ChartHeader>
      <UserGrowthChart data={userGrowthData} />
    </ChartCard>
    
    <ChartCard>
      <ChartHeader>
        <ChartTitle>Module Usage</ChartTitle>
        <ChartControls>
          <MetricSelector />
        </ChartControls>
      </ChartHeader>
      <ModuleUsageChart data={moduleUsageData} />
    </ChartCard>
  </DashboardCharts>
  
  <RecentActivity>
    <ActivityHeader>
      <SectionTitle>Recent Activity</SectionTitle>
      <ViewAllLink href="/admin/logs">View All</ViewAllLink>
    </ActivityHeader>
    <ActivityList>
      {recentActivity.map(activity => (
        <ActivityItem key={activity.id}>
          <ActivityIcon type={activity.type} />
          <ActivityContent>
            <ActivityDescription>{activity.description}</ActivityDescription>
            <ActivityTime>{activity.timestamp}</ActivityTime>
          </ActivityContent>
          <ActivityActions>
            <ActionButton size="sm" variant="ghost">View</ActionButton>
          </ActivityActions>
        </ActivityItem>
      ))}
    </ActivityList>
  </RecentActivity>
</AdminDashboard>
```

#### Data Tables
```jsx
<AdminDataTable>
  <TableHeader>
    <TableTitle>User Management</TableTitle>
    <TableActions>
      <SearchInput placeholder="Search users..." />
      <FilterButton />
      <ExportButton />
      <AddUserButton />
    </TableActions>
  </TableHeader>
  
  <DataTable>
    <TableHead>
      <TableRow>
        <SortableHeader field="name">Name</SortableHeader>
        <SortableHeader field="email">Email</SortableHeader>
        <SortableHeader field="role">Role</SortableHeader>
        <SortableHeader field="status">Status</SortableHeader>
        <SortableHeader field="lastActive">Last Active</SortableHeader>
        <TableHeader>Actions</TableHeader>
      </TableRow>
    </TableHead>
    
    <TableBody>
      {users.map(user => (
        <TableRow key={user.id}>
          <TableCell>
            <UserInfo>
              <UserAvatar src={user.avatar} />
              <UserName>{user.name}</UserName>
            </UserInfo>
          </TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>
            <RoleBadge role={user.role} />
          </TableCell>
          <TableCell>
            <StatusBadge status={user.status} />
          </TableCell>
          <TableCell>{formatDate(user.lastActive)}</TableCell>
          <TableCell>
            <ActionMenu>
              <ActionItem>View Profile</ActionItem>
              <ActionItem>Edit User</ActionItem>
              <ActionItem>Reset Password</ActionItem>
              <ActionItem danger>Disable Account</ActionItem>
            </ActionMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </DataTable>
  
  <TableFooter>
    <ResultsCount>Showing 1-20 of 1,247 users</ResultsCount>
    <Pagination 
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  </TableFooter>
</AdminDataTable>
```

---

## 🎨 Cross-App Design Tokens

### Shared Component Library
```typescript
// Shared across all apps
export const SharedComponents = {
  Button,
  Input,
  Card,
  Badge,
  Modal,
  Toast,
  Loading,
  Avatar,
  Icon
};

// App-specific extensions
export const WebComponents = {
  ...SharedComponents,
  Hero,
  Feature,
  Testimonial,
  CTA
};

export const AppComponents = {
  ...SharedComponents,
  ModuleHeader,
  HealthScore,
  ProgressBar,
  Chart
};
```

### Responsive Utilities
```css
/* Mobile-first breakpoints */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { 
    max-width: 768px;
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .container { 
    max-width: 1024px;
    padding: 0 2rem;
  }
}
```

---

**This comprehensive app specification provides detailed design guidance for each application in the Lumeos ecosystem, ensuring consistency while allowing for app-specific optimizations.**

**Last Updated:** 2026-03-25  
**Created By:** Jarvis AI Orchestrator