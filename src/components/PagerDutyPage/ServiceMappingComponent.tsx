import React, { useEffect, useState } from "react";
import { PagerDutyEntityMapping } from "@pagerduty/backstage-plugin-common";
import { useApi } from "@backstage/core-plugin-api";
import { pagerDutyApiRef } from "../../api";
import { catalogApiRef } from "@backstage/plugin-catalog-react";
import { MappingTable } from "./MappingTable";

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
            result.items.forEach((entity: any) => {
              const annotations: Annotations = JSON.parse(
                JSON.stringify(entity.metadata.annotations)
              );

              entities.push({
                name: entity.metadata?.name,
                id: entity.metadata?.uid ?? "",
                namespace: entity.metadata?.namespace ?? "",
                type: entity.kind ?? "",
                system: JSON.stringify(entity.spec?.system) || "",
                owner: JSON.stringify(entity.spec?.owner) || "",
                lifecycle: JSON.stringify(entity.spec?.lifecycle) || "",
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
      <MappingTable mappings={entityMappings} catalogEntities={catalogEntities}  />
  );
};
