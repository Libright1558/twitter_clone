const deletePost =
`DELETE FROM post_records 
WHERE post_id = $1`

export default {
  deletePost
}
