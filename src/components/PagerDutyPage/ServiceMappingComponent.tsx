import React, { useEffect, useState } from "react";
import { PagerDutyEntityMapping } from "@pagerduty/backstage-plugin-common";
import { useApi } from "@backstage/core-plugin-api";
import { pagerDutyApiRef } from "../../api";
import { catalogApiRef } from "@backstage/plugin-catalog-react";
import { MappingTable } from "./MappingTable";
import { BackstageEntity, Annotations } from "../types";

export const ServiceMappingComponent = () => {
  const [entityMappings, setEntityMappings] = useState<
    PagerDutyEntityMapping[]
  >([]);
  const [catalogEntities, setCatalogEntities] = useState<BackstageEntity[]>([]);

  const pagerDutyApi = useApi(pagerDutyApiRef);
  const catalogApi = useApi(catalogApiRef);

  // call fetchMappings() and fetchCatalogEntities() on useEffect hook
  useEffect(() => {
    function fetchMappings() {
      pagerDutyApi.getEntityMappings().then((result) => {
        setEntityMappings(result.mappings);
      });
    }

    function fetchCatalogEntities() {
      catalogApi
        .getEntities({
          filter: { kind: "Component" },
        })
        .then((result) => {
          const entities: BackstageEntity[] = [];
          result.items.forEach((entity) => {
            const annotations: Annotations = {
              "pagerduty.com/integration-key":
                entity.metadata?.annotations?.[
                  "pagerduty.com/integration-key"
                ] ?? "",
              "pagerduty.com/service-id":
                entity.metadata?.annotations?.["pagerduty.com/service-id"] ??
                "",
            };

            entities.push({
              name: entity.metadata?.name,
              id: entity.metadata?.uid ?? "",
              namespace: entity.metadata?.namespace ?? "",
              type: entity.kind ?? "",
              system: entity.spec?.system
                ? JSON.stringify(entity.spec?.system)
                : "",
              owner: entity.spec?.owner
                ? JSON.stringify(entity.spec?.owner)
                : "",
              lifecycle: entity.spec?.lifecycle
                ? JSON.stringify(entity.spec?.lifecycle)
                : "",
              annotations: annotations,
            });
          });

          setCatalogEntities(entities);
        });
    }

    fetchMappings();
    fetchCatalogEntities();
  }, [catalogApi, pagerDutyApi]);

  return (
    <MappingTable mappings={entityMappings} catalogEntities={catalogEntities} />
  );
};
