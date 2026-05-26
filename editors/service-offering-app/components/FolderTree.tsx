import {
  Sidebar,
  SidebarProvider,
  type SidebarNode,
} from "@powerhousedao/document-engineering";
import {
  setSelectedNode,
  useSelectedDrive,
  isFolderNodeKind,
  isFileNodeKind,
} from "@powerhousedao/reactor-browser";
import type {
  Node,
  FolderNode,
  FileNode,
} from "@powerhousedao/shared/document-drive";
import { CreditCard, FileText, Folder, Layers } from "lucide-react";
import { useMemo, useState } from "react";

const ICON_SIZE = 16;
const SERVICE_SUBSCRIPTIONS_FOLDER_NAME = "Service Subscriptions";
const SERVICES_AND_OFFERINGS_FOLDER_NAME = "Services And Offerings";
const RESOURCE_TEMPLATES_FOLDER_NAME = "Products";
const SERVICE_OFFERINGS_FOLDER_NAME = "Service Offerings";

/** Custom view types that don't correspond to document models */
export type CustomView = "resources-services" | "service-subscriptions" | null;

/** Maps navigation section IDs to custom view identifiers. */
const SECTION_TO_CUSTOM_VIEW: Record<string, CustomView> = {
  "service-subscriptions": "service-subscriptions",
  "resources-services": "resources-services",
};

/**
 * Base navigation sections for the Service Offering App.
 * Sections get dynamic children added from the matching drive folders.
 */
const BASE_NAVIGATION_SECTIONS: SidebarNode[] = [
  {
    id: "service-subscriptions",
    title: "Service Subscriptions",
    icon: <CreditCard size={ICON_SIZE} />,
  },
  {
    id: "resources-services",
    title: "Service Offerings",
    icon: <Layers size={ICON_SIZE} />,
  },
];

/**
 * Recursively builds SidebarNode children from folder contents.
 * Folders get folder icons, files get document icons.
 */
function buildSidebarNodesFromFolder(
  parentId: string,
  allNodes: Node[],
): SidebarNode[] {
  const childNodes = allNodes.filter((node) => {
    if (isFolderNodeKind(node)) {
      return node.parentFolder === parentId;
    }
    if (isFileNodeKind(node)) {
      return (node as FileNode).parentFolder === parentId;
    }
    return false;
  });

  return childNodes.map((node) => {
    const isFolder = isFolderNodeKind(node);
    const sidebarNode: SidebarNode = {
      id: node.id,
      title: node.name,
      icon: isFolder ? (
        <Folder size={ICON_SIZE} />
      ) : (
        <FileText size={ICON_SIZE} />
      ),
    };

    if (isFolder) {
      const children = buildSidebarNodesFromFolder(node.id, allNodes);
      if (children.length > 0) {
        sidebarNode.children = children;
      }
    }

    return sidebarNode;
  });
}

type FolderTreeProps = {
  onCustomViewChange?: (view: CustomView) => void;
};

/**
 * Sidebar for the Service Offering App.
 * Two sections: Service Subscriptions and Service Offerings (Products + Service
 * Offerings folders inside the "Services And Offerings" parent). Each section
 * routes to its own custom view; child folder/document clicks navigate within
 * that view.
 */
export function FolderTree({ onCustomViewChange }: FolderTreeProps) {
  const [activeNodeId, setActiveNodeId] = useState<string>(
    BASE_NAVIGATION_SECTIONS[0].id,
  );

  const [driveDocument] = useSelectedDrive();

  // Find the "Service Subscriptions" folder in the drive
  const serviceSubscriptionsFolder = useMemo(() => {
    if (!driveDocument) return null;
    const nodes = driveDocument.state.global.nodes;
    return nodes.find(
      (node: Node): node is FolderNode =>
        isFolderNodeKind(node) &&
        node.name === SERVICE_SUBSCRIPTIONS_FOLDER_NAME,
    );
  }, [driveDocument]);

  // Find the "Services And Offerings" parent folder in the drive (at root level)
  const servicesAndOfferingsFolder = useMemo(() => {
    if (!driveDocument) return null;
    const nodes = driveDocument.state.global.nodes;
    return nodes.find(
      (node: Node): node is FolderNode =>
        isFolderNodeKind(node) &&
        node.name === SERVICES_AND_OFFERINGS_FOLDER_NAME &&
        !node.parentFolder,
    );
  }, [driveDocument]);

  // Find the "Products" folder (inside Services And Offerings folder)
  const resourceTemplatesFolder = useMemo(() => {
    if (!driveDocument || !servicesAndOfferingsFolder) return null;
    const nodes = driveDocument.state.global.nodes;
    return nodes.find(
      (node: Node): node is FolderNode =>
        isFolderNodeKind(node) &&
        node.name === RESOURCE_TEMPLATES_FOLDER_NAME &&
        node.parentFolder === servicesAndOfferingsFolder.id,
    );
  }, [driveDocument, servicesAndOfferingsFolder]);

  // Find the "Service Offerings" folder (inside Services And Offerings folder)
  const serviceOfferingsFolder = useMemo(() => {
    if (!driveDocument || !servicesAndOfferingsFolder) return null;
    const nodes = driveDocument.state.global.nodes;
    return nodes.find(
      (node: Node): node is FolderNode =>
        isFolderNodeKind(node) &&
        node.name === SERVICE_OFFERINGS_FOLDER_NAME &&
        node.parentFolder === servicesAndOfferingsFolder.id,
    );
  }, [driveDocument, servicesAndOfferingsFolder]);

  // Collect all node IDs descended from a given parent folder
  function collectDescendantIds(
    parentId: string,
    allNodes: Node[],
  ): Set<string> {
    const ids = new Set<string>();
    const visit = (id: string) => {
      ids.add(id);
      for (const node of allNodes) {
        if (isFolderNodeKind(node) && node.parentFolder === id) {
          visit(node.id);
        } else if (isFileNodeKind(node) && node.parentFolder === id) {
          ids.add(node.id);
        }
      }
    };
    visit(parentId);
    return ids;
  }

  const serviceSubscriptionsNodeIds = useMemo(() => {
    if (!serviceSubscriptionsFolder || !driveDocument) return new Set<string>();
    return collectDescendantIds(
      serviceSubscriptionsFolder.id,
      driveDocument.state.global.nodes,
    );
  }, [serviceSubscriptionsFolder, driveDocument]);

  const resourceTemplatesNodeIds = useMemo(() => {
    if (!resourceTemplatesFolder || !driveDocument) return new Set<string>();
    return collectDescendantIds(
      resourceTemplatesFolder.id,
      driveDocument.state.global.nodes,
    );
  }, [resourceTemplatesFolder, driveDocument]);

  const serviceOfferingsNodeIds = useMemo(() => {
    if (!serviceOfferingsFolder || !driveDocument) return new Set<string>();
    return collectDescendantIds(
      serviceOfferingsFolder.id,
      driveDocument.state.global.nodes,
    );
  }, [serviceOfferingsFolder, driveDocument]);

  // Build navigation sections with dynamic children
  const navigationSections = useMemo(() => {
    if (!driveDocument) {
      return BASE_NAVIGATION_SECTIONS;
    }

    const allNodes = driveDocument.state.global.nodes;

    // Service Subscriptions children = direct contents of the folder
    const serviceSubscriptionsChildren = serviceSubscriptionsFolder
      ? buildSidebarNodesFromFolder(serviceSubscriptionsFolder.id, allNodes)
      : [];

    // Resources & Services children = Products + Service Offerings subfolders
    const resourcesServicesChildren: SidebarNode[] = [];
    if (resourceTemplatesFolder) {
      const resourceTemplatesChildren = buildSidebarNodesFromFolder(
        resourceTemplatesFolder.id,
        allNodes,
      );
      resourcesServicesChildren.push({
        id: resourceTemplatesFolder.id,
        title: RESOURCE_TEMPLATES_FOLDER_NAME,
        icon: <Folder size={ICON_SIZE} />,
        children:
          resourceTemplatesChildren.length > 0
            ? resourceTemplatesChildren
            : undefined,
      });
    }
    if (serviceOfferingsFolder) {
      const serviceOfferingsChildren = buildSidebarNodesFromFolder(
        serviceOfferingsFolder.id,
        allNodes,
      );
      resourcesServicesChildren.push({
        id: serviceOfferingsFolder.id,
        title: SERVICE_OFFERINGS_FOLDER_NAME,
        icon: <Folder size={ICON_SIZE} />,
        children:
          serviceOfferingsChildren.length > 0
            ? serviceOfferingsChildren
            : undefined,
      });
    }

    return BASE_NAVIGATION_SECTIONS.map((section) => {
      if (
        section.id === "service-subscriptions" &&
        serviceSubscriptionsChildren.length > 0
      ) {
        return { ...section, children: serviceSubscriptionsChildren };
      }
      if (
        section.id === "resources-services" &&
        resourcesServicesChildren.length > 0
      ) {
        return { ...section, children: resourcesServicesChildren };
      }
      return section;
    });
  }, [
    driveDocument,
    serviceSubscriptionsFolder,
    resourceTemplatesFolder,
    serviceOfferingsFolder,
  ]);

  const driveName = driveDocument?.state.global.name || "Service Offerings";

  const handleActiveNodeChange = (node: SidebarNode) => {
    setActiveNodeId(node.id);

    // Child node within Service Subscriptions tree
    if (serviceSubscriptionsNodeIds.has(node.id)) {
      const driveNode = driveDocument?.state.global.nodes.find(
        (n: Node) => n.id === node.id,
      );
      if (driveNode && isFolderNodeKind(driveNode)) {
        onCustomViewChange?.("service-subscriptions");
        setSelectedNode(node.id);
      } else if (driveNode && isFileNodeKind(driveNode)) {
        onCustomViewChange?.(null);
        setSelectedNode(node.id);
      }
      return;
    }

    // Child node within Products tree
    if (resourceTemplatesNodeIds.has(node.id)) {
      const driveNode = driveDocument?.state.global.nodes.find(
        (n: Node) => n.id === node.id,
      );
      if (driveNode && isFolderNodeKind(driveNode)) {
        onCustomViewChange?.("resources-services");
        setSelectedNode(node.id);
      } else if (driveNode && isFileNodeKind(driveNode)) {
        onCustomViewChange?.(null);
        setSelectedNode(node.id);
      }
      return;
    }

    // Child node within Service Offerings tree
    if (serviceOfferingsNodeIds.has(node.id)) {
      const driveNode = driveDocument?.state.global.nodes.find(
        (n: Node) => n.id === node.id,
      );
      if (driveNode && isFolderNodeKind(driveNode)) {
        onCustomViewChange?.("resources-services");
        setSelectedNode(node.id);
      } else if (driveNode && isFileNodeKind(driveNode)) {
        onCustomViewChange?.(null);
        setSelectedNode(node.id);
      }
      return;
    }

    // Top-level section: switch to its custom view
    const customView = SECTION_TO_CUSTOM_VIEW[node.id];
    if (customView) {
      onCustomViewChange?.(customView);
      setSelectedNode("");
      return;
    }

    onCustomViewChange?.(null);
  };

  return (
    <SidebarProvider nodes={navigationSections}>
      <Sidebar
        className="pt-1"
        nodes={navigationSections}
        activeNodeId={activeNodeId}
        onActiveNodeChange={handleActiveNodeChange}
        sidebarTitle={driveName}
        showSearchBar={false}
        resizable={true}
        allowPinning={false}
        showStatusFilter={false}
        initialWidth={256}
        defaultLevel={2}
        handleOnTitleClick={() => {
          onCustomViewChange?.(null);
          setSelectedNode("");
        }}
      />
    </SidebarProvider>
  );
}
