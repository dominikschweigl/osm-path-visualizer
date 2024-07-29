import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";

export default function LocationsInput({
  start,
  destination,
  setSearchStarted,
}: {
  start: GeoLocationPoint | null;
  destination: GeoLocationPoint | null;
  setSearchStarted: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
      <legend className="-ml-1 px-1 text-sm font-medium">Locations</legend>
      <div className="grid gap-2">
        <div className="flex flex-nowrap">
          <Label htmlFor="start">Start</Label>
        </div>
        <Input id="start" type="string" placeholder={`lat:${start?.lat.toFixed(2)}, lon:${start?.lon.toFixed(2)}`} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="destination">Destination</Label>
        <Input id="destination" type="string" placeholder={`lat:${destination?.lat.toFixed(2)}, lon:${destination?.lon.toFixed(2)}`} />
      </div>
      <Button onClick={() => setSearchStarted(true)} type="button">
        Search
      </Button>
    </fieldset>
  );
}
