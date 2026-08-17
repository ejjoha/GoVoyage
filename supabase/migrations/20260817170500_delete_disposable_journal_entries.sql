-- Disposable-data reset ahead of the D2 journal-image authorization rebuild.
--
-- The four currently existing journal entries were explicitly confirmed
-- disposable. Fail closed if production state has changed since review rather
-- than deleting a subset of an unexpected journal dataset.

do $$
declare
  actual_ids bigint[];
begin
  select coalesce(
    array_agg(id order by id),
    '{}'::bigint[]
  )
  into actual_ids
  from public.journal_entries;

  if actual_ids <> array[3, 4, 5, 6]::bigint[] then
    raise exception
      'Refusing D2 journal reset: expected journal_entries ids {3,4,5,6}, found %',
      actual_ids;
  end if;

  delete from public.journal_entries
  where id in (3, 4, 5, 6);
end
$$;
