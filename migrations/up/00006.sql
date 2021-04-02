DROP FUNCTION IF EXISTS lists.fngetlist(list_id uuid, user_id uuid);

CREATE OR REPLACE FUNCTION lists.fngetlist(list_id uuid, user_id uuid)
    RETURNS TABLE
            (
                id             uuid,
                userid         uuid,
                name           varchar,
                created_at     timestamptz,
                cntItems       bigint,
                cntUsers       bigint,
                cntBoughtItems bigint,
                users          varchar,
                items          varchar
            )
AS
$func$
BEGIN
    DROP TABLE IF EXISTS tmpUsers;
    DROP TABLE IF EXISTS tmpItems;

    CREATE TEMP TABLE tmpUsers AS
    SELECT u.*
    from users."user" AS u
             LEFT JOIN lists.list AS l ON u.id = l.userid
    WHERE l.id = list_id
    UNION ALL
    SELECT u2.*
    FROM lists.list_user AS lu
             LEFT JOIN lists.list AS l2 on lu.listid = l2.id
             LEFT JOIN users."user" AS u2 ON lu.userid = u2.id
    WHERE l2.id = list_id;

    -- items
    CREATE TEMP TABLE tmpItems AS
    SELECT * FROM lists.list_item AS li WHERE li.listid = list_id;

    RETURN QUERY
        SELECT DISTINCT l.*,
                        COALESCE(lic.cntItems, 0)                            AS cntItems,
                        (COALESCE(lu.cntUsers, 0) + 1)                       AS cntUsers,
                        COALESCE(lic.cntBoughtItems, 0)                      AS cntBoughtItems,
                        (SELECT json_agg(tmu) FROM tmpUsers AS tmu)::varchar AS "lst_users",
                        (SELECT json_agg(tmi) FROM tmpItems AS tmi)::varchar AS "lst_items"
        FROM lists.list AS l
                 LEFT JOIN (
            SELECT lli.listid,
                   COUNT(lli.id)                                              AS cntItems,
                   COUNT(CASE WHEN purchaseduserid IS NULL THEN 0 ELSE 1 END) AS cntBoughtItems
            FROM lists.list_item AS lli
            GROUP BY listid
        ) AS lic ON lic.listid = l.id
                 LEFT JOIN (
            SELECT llu.listid, COUNT(llu.userid) as cntUsers
            FROM lists.list_user AS llu
            GROUP BY listid
        ) AS lu ON lu.listid = l.id
                 LEFT JOIN lists.list_user AS llu ON l.id = llu.listid
        WHERE (l.id) = list_id
          AND (l.userid = user_id OR llu.userid = user_id)
        ORDER BY l.created_at DESC;
END
$func$ LANGUAGE plpgsql;
