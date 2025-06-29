// src/components/custom/RuleBuilder.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useDataStore } from '@/store/dataStore';
import { v4 as uuidv4 } from 'uuid';
import { CoRunRule, LoadLimitRule } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function RuleBuilder() {
  const tasks = useDataStore((state) => state.tasks);
  const workers = useDataStore((state) => state.workers);
  const rules = useDataStore((state) => state.rules);
  const addRule = useDataStore((state) => state.addRule);
  const deleteRule = useDataStore((state) => state.deleteRule);

  const [coRunTaskIds, setCoRunTaskIds] = useState<string[]>([]);
  const [coRunPopoverOpen, setCoRunPopoverOpen] = useState(false);
  const [limitWorkerGroup, setLimitWorkerGroup] = useState<string>('');
  const [limitMaxSlots, setLimitMaxSlots] = useState<number>(1);

  const workerGroups = useMemo(() => {
    const groups = new Set(workers.map(w => w.WorkerGroup).filter(Boolean));
    return Array.from(groups);
  }, [workers]);

  const handleAddCoRunRule = () => {
    if (coRunTaskIds.length < 2) {
      toast.warning("Please select at least two tasks for a co-run rule.");
      return;
    }
    const newRule: CoRunRule = {
      id: uuidv4(),
      type: 'coRun',
      tasks: coRunTaskIds,
      description: `Tasks ${coRunTaskIds.join(', ')} must run together.`
    };
    addRule(newRule);
    setCoRunTaskIds([]);
    toast.success("Co-run rule added successfully.");
  };
  
  const handleAddLoadLimitRule = () => {
    if (!limitWorkerGroup) {
      toast.warning("Please select a worker group.");
      return;
    }
    if (limitMaxSlots <= 0) {
      toast.warning("Max slots must be a positive number.");
      return;
    }
    const newRule: LoadLimitRule = {
      id: uuidv4(),
      type: 'loadLimit',
      groupType: 'worker',
      groupName: limitWorkerGroup,
      maxSlotsPerPhase: limitMaxSlots,
      description: `Workers in ${limitWorkerGroup} can take a maximum of ${limitMaxSlots} slot(s) per phase.`
    };
    addRule(newRule);
    setLimitWorkerGroup('');
    setLimitMaxSlots(1);
    toast.success("Load-limit rule added successfully.");
  };

  const taskOptions = tasks.map(task => ({
    value: task.TaskID,
    label: `${task.TaskID} (${task.TaskName})`,
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>3. Define Business Rules</CardTitle>
        <CardDescription>Create rules to guide the resource allocation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
            <h4 className="font-semibold">Add Co-run Rule</h4>
            <p className="text-sm text-muted-foreground">Select two or more tasks that must run together.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={coRunPopoverOpen} onOpenChange={setCoRunPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-[300px] justify-between">
                    {coRunTaskIds.length > 0 ? `${coRunTaskIds.length} tasks selected` : "Select Tasks..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search tasks..." />
                    <CommandList>
                      <CommandEmpty>No tasks found.</CommandEmpty>
                      <CommandGroup>
                        {taskOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            onSelect={() => {
                              setCoRunTaskIds(prev => prev.includes(option.value) ? prev.filter(id => id !== option.value) : [...prev, option.value])
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", coRunTaskIds.includes(option.value) ? "opacity-100" : "opacity-0")} />
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button onClick={handleAddCoRunRule} disabled={coRunTaskIds.length < 2}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[20px]">{coRunTaskIds.map(id => <Badge key={id} variant="secondary">{id}</Badge>)}</div>
          </div>

          <div className="p-4 border rounded-lg space-y-4 bg-muted/20">
            <h4 className="font-semibold">Add Load-limit Rule</h4>
            <p className="text-sm text-muted-foreground">Limit the number of slots a worker group can handle per phase.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={limitWorkerGroup} onValueChange={setLimitWorkerGroup}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Worker Group" />
                </SelectTrigger>
                <SelectContent>
                  {workerGroups.length > 0 ? workerGroups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  )) : <div className="p-4 text-sm text-muted-foreground">No worker groups found.</div>}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={limitMaxSlots}
                onChange={(e) => setLimitMaxSlots(parseInt(e.target.value, 10) || 0)}
                className="w-[150px]"
                placeholder="Max Slots"
                min="1"
              />
              <Button onClick={handleAddLoadLimitRule} disabled={!limitWorkerGroup || limitMaxSlots <= 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <h4 className="font-medium text-lg border-t pt-4">Current Rules:</h4>
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No rules defined yet.</p>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <p className="text-sm font-medium">{rule.description}</p>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteRule(rule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}