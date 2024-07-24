import React, { useEffect, useMemo, useState } from "react";
import { PagerDutyEntityMapping } from "@pagerduty/backstage-plugin-common";
import {
  MRT_ColumnDef,
  MRT_EditActionButtons,
  MRT_TableOptions,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { Edit, OpenInBrowser } from "@mui/icons-material";
import { useApi } from "@backstage/core-plugin-api";
import { pagerDutyApiRef } from "../../api";

type BackstageEntity = {
  id: string;
  name: string;
  namespace: string;
  type: string;
  system: string;
  owner: string;
  lifecycle: string;
  annotations: Annotations;
};

export type Annotations = {
  "pagerduty.com/integration-key": string;
  "pagerduty.com/service-id": string;
};

function getColorFromStatus(status?: string) {
  switch (status) {
    case "InSync":
      return "green";
    case "OutOfSync":
      return "red";
    case "NotMapped":
      return "orange";
    default:
      return "gray";
  }
}

function makeReadable(status?: string) {
  switch (status) {
    case "InSync":
      return "In Sync";
    case "OutOfSync":
      return "Out of Sync";
    case "NotMapped":
      return "Not Mapped";
    default:
      return "Refresh to Update";
  }
}

type CatalogEntityOptions = {
  value: string;
  label: string;
};

type MappingTableProps = {
  mappings: PagerDutyEntityMapping[];
  catalogEntities: BackstageEntity[];
};

export const MappingTable = ({
  mappings,
  catalogEntities,
}: MappingTableProps) => {
  const DenseTable = () => {
    const [validationErrors, setValidationErrors] = useState<
      Record<string, string | undefined>
    >({});
    const [entityOptions, setEntityOptions] = useState<CatalogEntityOptions[]>(
      []
    );
    const pagerDutyApi = useApi(pagerDutyApiRef);

    useEffect(() => {
      getEntityOptions();
    }, []);

    const columns = useMemo<MRT_ColumnDef<PagerDutyEntityMapping>[]>(
      () => [
        {
          accessorKey: "serviceId",
          header: "Service ID",
          visibleInShowHideMenu: false,
          enableEditing: false,
          Edit: () => null,
          Cell: ({ cell }) => (
            <Typography variant="body1" style={{ fontWeight: 600 }}>
              {cell.getValue<string>()}
            </Typography>
          ),
        },
        {
          accessorKey: "integrationKey",
          header: "Integration Key",
          visibleInShowHideMenu: false,
          enableEditing: false,
          Edit: () => null,
        },
        {
          accessorKey: "serviceName",
          header: "PagerDuty Service",
          enableEditing: false,
        },
        {
          accessorKey: "account",
          header: "Account",
          enableEditing: false,
          Edit: () => null,
        },
        {
          accessorKey: "team",
          header: "Team",
          enableEditing: false,
        },
        {
          accessorKey: "escalationPolicy",
          header: "Escalation Policy",
          enableEditing: false,
        },
        {
          accessorKey: "entityRef",
          header: "Mapping",
          visibleInShowHideMenu: false,
          editVariant: "select",
          editSelectOptions: entityOptions,
          muiEditTextFieldProps: {
            select: true,
            error: !!validationErrors?.state,
            helperText: validationErrors?.state,
            multiline: true,
            type: "range",
          },
        },
        {
          accessorKey: "entityName",
          header: "Mapped Entity Name",
          enableEditing: false,
          Edit: () => null,
        },
        {
          accessorKey: "status",
          header: "Status",
          enableEditing: false,
          Edit: () => null,
          Cell: ({ cell }) => (
            <Box
              component="span"
              bgcolor={getColorFromStatus(cell.getValue<string>())}
              borderRadius="0.25rem"
              color="white"
              p="0.25rem"
            >
              {makeReadable(cell.getValue<string>())}
            </Box>
          ),
        },
        {
          accessorKey: "serviceUrl",
          header: "Service URL",
          visibleInShowHideMenu: false,
          enableEditing: false,
          Edit: () => null,
        },
      ],
      [validationErrors, entityOptions]
    );

    // UPDATE hook (put mapping in api)
    function useUpdateMapping() {
      return useMutation({
        mutationFn: async (mapping: PagerDutyEntityMapping) => {
          return await pagerDutyApi.storeServiceMapping(
            mapping.serviceId,
            mapping.integrationKey ?? "",
            mapping.entityRef,
            mapping.account ?? ""
          );
        },
      });
    }

    // call UPDATE hook
    const { mutateAsync: updateMapping, isPending: isUpdatingMapping } =
      useUpdateMapping();

    // UPDATE action
    const handleSaveMapping: MRT_TableOptions<PagerDutyEntityMapping>["onEditingRowSave"] =
      async ({ values, table }) => {
        setValidationErrors({});

        values.entityName =
          catalogEntities.find(
            (entity) =>
              `${entity.type}:${entity.namespace}/${entity.name}`.toLowerCase() ===
              values.entityRef
          )?.name ?? "";
        values.status = "RefreshToUpdate";

        await updateMapping(values);

        // find corresponding mapping in mappings array
        // and update it with new values
        const existingMapping = mappings.find(
          (item) => item.serviceId === values.serviceId
        );
        if (existingMapping) {
          existingMapping.entityRef = values.entityRef;
          existingMapping.entityName = values.entityName;
        }

        table.setEditingRow(null); // exit editing mode
      };

    const openInBrowser = (url: string) => {
      window.open(url, "_blank", "noreferrer");
    };

    const dataTable = useMaterialReactTable({
      columns,
      data: mappings,
      editDisplayMode: "modal",
      enableEditing: true,
      positionActionsColumn: "last",
      enableStickyHeader: true,
      enableFilters: true,
      getRowId: (row) => row.serviceId,
      muiToolbarAlertBannerProps:
        mappings === undefined
          ? {
              color: "error",
              children: "Error loading data",
            }
          : undefined,
      muiTableContainerProps: {
        sx: {
          minHeight: "500px",
        },
      },
      onEditingRowCancel: () => setValidationErrors({}),
      onEditingRowSave: handleSaveMapping,
      renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
        <>
          <DialogTitle>Update Entity Mapping</DialogTitle>
          <DialogContent
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {internalEditComponents}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      ),
      renderRowActions: ({ row, table }) => (
        <Box sx={{ display: "flex" }}>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => {
                getEntityOptions();
                table.setEditingRow(row);
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open in PagerDuty">
            <IconButton
              onClick={() => openInBrowser(row.getValue("serviceUrl"))}
            >
              <OpenInBrowser />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      state: {
        isLoading: mappings.length === 0 || catalogEntities.length === 0,
        isSaving: isUpdatingMapping,
        showAlertBanner:
          mappings === undefined || catalogEntities === undefined,
        showProgressBars: mappings.length === 0 || catalogEntities.length === 0,
        columnVisibility: {
          serviceId: false,
          entityRef: false,
          serviceUrl: false,
          integrationKey: false,
        },
      },
    });

    function getEntityOptions() {
      const options: CatalogEntityOptions[] = [];
      // initialize with empty object
      options.push({ value: "", label: "None" });

      catalogEntities.forEach((entity) => {
        // find service-id annotation in entity
        const foundServiceAnnotation =
          entity.annotations["pagerduty.com/service-id"];

        // find integration-key annotation in entity
        const foundIntegrationKeyAnnotation =
          entity.annotations["pagerduty.com/integration-key"];

        // find entity with service-id in mappings array if service-id is found in entity
        let foundServiceMapping: PagerDutyEntityMapping | undefined;
        if (foundServiceAnnotation || foundIntegrationKeyAnnotation) {
          foundServiceMapping = mappings.find(
            (item) =>
              item.serviceId === foundServiceAnnotation ||
              item.integrationKey === foundIntegrationKeyAnnotation
          );
        }

        const entityRef =
          `${entity.type}:${entity.namespace}/${entity.name}`.toLowerCase();
        // find entity with entity.id in entityMappings array
        const foundEntityMapping = mappings.find(
          (item) => item.entityRef === entityRef
        );

        if (
          (!foundEntityMapping &&
            (!foundServiceAnnotation || !foundIntegrationKeyAnnotation)) ||
          ((foundServiceAnnotation || foundIntegrationKeyAnnotation) &&
            foundServiceMapping &&
            !foundEntityMapping)
        ) {
          options.push({
            value: entityRef,
            label: entity.name,
          });
        }
      });

      setEntityOptions(options);
    }

    return <MaterialReactTable table={dataTable} />;
  };

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DenseTable />
    </QueryClientProvider>
  );
};
