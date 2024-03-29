import React, { ReactNode } from 'react';
import useSWR from 'swr';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Button,
  Divider,
} from '@chakra-ui/react';
import {
  FiMail,
  FiUsers,
  FiMenu,
  FiUser,
  FiMessageCircle,
  FiFile,
  FiBox,
  FiLayout,
  FiList,
  FiCoffee,
  FiCalendar,
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import {
  useSession,
  UserAccountDropdown,
  signIn,
  NotificationBell,
  ChatMessageBell,
  AccessServiceEnum,
  RoqResourceEnum,
  useAuthorizationApi,
  AccessOperationEnum,
} from '@roq/nextjs';
import Link from 'next/link';
import { HelpBox } from 'components/help-box';
import { AppLogo } from 'layout/app-logo';

import { RestaurantInterface } from 'interfaces/restaurant';
import { getRestaurants } from 'apiSdk/restaurants';

interface LinkItemProps {
  name: string;
  icon?: IconType;
  path: string;
  entity: string;
  service?: AccessServiceEnum;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <HelpBox />
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  let loading = false;
  const { session } = useSession();
  const { hasAccess } = useAuthorizationApi();

  const tenantRoles = ['owner', 'chef', 'waiter'];
  const isTenantUser = tenantRoles.some((role) => session?.user?.roles?.includes(role));
  const { data, error, isLoading } = useSWR<RestaurantInterface[]>(
    () => (isTenantUser && session?.user?.tenantId ? `/restaurants` : null),
    () => getRestaurants({ tenant_id: session?.user?.tenantId }),
  );
  loading = isLoading;

  const LinkItems: Array<LinkItemProps> = [
    { name: 'Users', icon: FiUsers, path: '/users', entity: 'user', service: AccessServiceEnum.PROJECT },
    { name: 'Invites', icon: FiMail, path: '/invites', entity: RoqResourceEnum.INVITE },

    {
      name: 'Restaurant',
      path: isTenantUser ? `/restaurants/view/${data?.[0]?.id}` : '/restaurants',
      entity: 'restaurant',
      service: AccessServiceEnum.PROJECT,
      icon: FiCoffee,
    },
    { name: 'Menu Item', path: '/menu-items', entity: 'menu_item', service: AccessServiceEnum.PROJECT, icon: FiList },
    {
      name: 'Reservation',
      path: '/reservations',
      entity: 'reservation',
      service: AccessServiceEnum.PROJECT,
      icon: FiCalendar,
    },
    { name: 'Table', path: '/tables', entity: 'table', service: AccessServiceEnum.PROJECT, icon: FiLayout },

    /** Add navigation item here **/
  ];
  const mainNav = LinkItems.filter((e) => e.service === AccessServiceEnum.PROJECT);
  const secondaryNav = LinkItems.filter((e) => e.service !== AccessServiceEnum.PROJECT);
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex bg="white" pos="fixed" h="20" w="100%" alignItems="center" mx="8" justifyContent="space-between">
        <AppLogo />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Box h="full" pt="20" pb="6" overflowY="auto">
        {!loading &&
          mainNav
            .filter((e) => hasAccess(e.entity, AccessOperationEnum.READ, e.service))
            .map((link) => (
              <NavItem key={link.name} icon={link.icon} path={link.path}>
                {link.name}
              </NavItem>
            ))}
        <Divider borderWidth="1px" />
        {secondaryNav
          .filter((e) => hasAccess(e.entity, AccessOperationEnum.READ, e.service))
          .map((link) => (
            <NavItem key={link.name} icon={link.icon} path={link.path}>
              {link.name}
            </NavItem>
          ))}
      </Box>
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: string | number;
  path: string;
}
const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
  return (
    <Link href={path} style={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'cyan.400',
          color: 'white',
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { session } = useSession();

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <AppLogo isMobile />

      <HStack spacing={{ base: '0', md: '6' }}>
        {session?.roqUserId && <Text position="relative">{`${session.user?.roles?.join(', ')}`}</Text>}
        <NotificationBell />
        <Flex alignItems={'center'}>{session?.roqUserId && <UserAccountDropdown />}</Flex>
      </HStack>
    </Flex>
  );
};
