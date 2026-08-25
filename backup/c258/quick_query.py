import os
import sys
sys.path.insert(0, "tools")
from lauf import lauf

db = os.environ.get("PGDATABASE", "lumeos_c258_probe")
sql = r"""
select source, count(*), count(*) filter (where im_katalog), count(*) filter (where not im_katalog), count(*) filter (where parent_id is null)
from supplements.supplements
group by source
order by source;
"""
print(lauf(["docker","exec","supabase_db_LumeOS-Claude-V1","psql","-U","postgres","-d",db,"-t","-A","-F","\t","-v","ON_ERROR_STOP=1","-c",sql]))
